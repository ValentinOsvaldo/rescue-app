<script setup lang="ts">
import type { RescueRequestFormState } from '~/schemas/rescue-create';
import type { CatalogDropdownFetcher } from '~/composables/useCatalogDropdown';
import { RESCUE_SERVICE_TYPE_OPTIONS } from '~/constants/rescue-select-options';
import { showsGestorInStepOne } from '~/utils/rescue-request';
import { parseRescueCoord } from '~/schemas/rescue-create';

const state = defineModel<RescueRequestFormState>({ required: true });

defineProps<{
  fetchManagerDropdown: CatalogDropdownFetcher;
}>();

const serviceTypeOption = computed(() =>
  RESCUE_SERVICE_TYPE_OPTIONS.find((o) => o.value === state.value.service_type),
);

const gestorFromStepOne = computed(() =>
  showsGestorInStepOne(state.value.service_type),
);

const locationCoordsLabel = computed(() => {
  const lat = parseRescueCoord(state.value.location_latitude);
  const lng = parseRescueCoord(state.value.location_longitude);
  if (lat == null || lng == null) return '—';
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
});
</script>

<template>
  <div class="space-y-4">
    <UCard variant="subtle" :ui="{ body: 'space-y-3 text-sm' }">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-primary">
        Resumen
      </h3>

      <dl class="grid gap-2 sm:grid-cols-2">
        <div>
          <dt class="text-muted">Tipo de solicitud</dt>
          <dd class="flex items-center gap-2 font-medium">
            <UIcon
              v-if="serviceTypeOption?.icon"
              :name="serviceTypeOption.icon"
              class="size-4"
            />
            {{ serviceTypeOption?.label ?? state.service_type }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">Cliente</dt>
          <dd class="font-medium">
            {{ state.clientLabel || (state.client ? `Cliente #${state.client}` : '—') }}
          </dd>
        </div>
        <div v-if="state.serialNumber">
          <dt class="text-muted">Número económico</dt>
          <dd class="font-medium">{{ state.serialNumber }}</dd>
        </div>
        <div v-if="state.general_public">
          <dt class="text-muted">Público en general</dt>
          <dd class="font-medium">Sí</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-muted">Ubicación</dt>
          <dd class="font-medium">
            {{ state.location_description || '—' }}
            <span class="mt-0.5 block text-xs text-muted">
              {{ locationCoordsLabel }}
            </span>
          </dd>
        </div>
        <div
          v-if="state.service_type === 'rescue'"
          class="sm:col-span-2"
        >
          <dt class="text-muted">Descripción del servicio</dt>
          <dd class="font-medium whitespace-pre-wrap">
            {{ state.service_description || '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">Proveedor</dt>
          <dd class="font-medium">
            {{
              state.supplierLabel
                || (state.supplier ? `Proveedor #${state.supplier}` : 'Sin proveedor')
            }}
          </dd>
        </div>
        <div v-if="gestorFromStepOne && state.manager">
          <dt class="text-muted">Gestor (paso 1)</dt>
          <dd class="font-medium">
            {{ state.managerLabel || `Usuario #${state.manager}` }}
          </dd>
        </div>
      </dl>
    </UCard>

    <UFormField
      v-if="!gestorFromStepOne"
      label="Gestor"
      name="manager"
    >
      <CatalogDropdownSelect
        v-model="state.manager"
        placeholder="Buscar gestor"
        :fetcher="fetchManagerDropdown"
      />
    </UFormField>

    <UFormField label="Nota interna" name="internal_notes">
      <UTextarea v-model="state.internal_notes" class="w-full" :rows="4" />
    </UFormField>
  </div>
</template>
