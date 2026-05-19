import type { RescueCompanySettings } from '~/interfaces/rescue/company-settings';
import { mapRescueCompanySettings } from '~/utils/rescue-company-settings';

export function useRescueCompanySettings(
  clientId: Ref<number | undefined>,
) {
  const settings = ref<RescueCompanySettings | null>(null);
  const pending = ref(false);
  const error = ref<Error | null>(null);

  let requestId = 0;

  async function load(id: number) {
    const currentRequest = ++requestId;
    pending.value = true;
    error.value = null;

    try {
      const raw = await $fetch<Record<string, unknown>>(
        `/api/rescue/client/settings/${id}/`,
      );
      if (currentRequest !== requestId) return;
      settings.value = mapRescueCompanySettings(raw);
    } catch (e) {
      if (currentRequest !== requestId) return;
      settings.value = null;
      error.value = e instanceof Error ? e : new Error('No se pudieron cargar los ajustes');
    } finally {
      if (currentRequest === requestId) {
        pending.value = false;
      }
    }
  }

  function reset() {
    requestId += 1;
    settings.value = null;
    pending.value = false;
    error.value = null;
  }

  watch(
    clientId,
    (id) => {
      if (id == null) {
        reset();
        return;
      }
      load(id);
    },
    { immediate: true },
  );

  return {
    settings,
    pending: readonly(pending),
    error: readonly(error),
    refresh: () => {
      const id = clientId.value;
      if (id != null) return load(id);
      return Promise.resolve();
    },
  };
}
