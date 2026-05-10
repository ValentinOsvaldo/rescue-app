import { watchDebounced } from '@vueuse/core';
import type { CatalogDropdownRow } from '~/interfaces/shared/catalog-dropdown.interface';
import type { PaginatedResponse } from '~/interfaces/shared/pagination.interface';

export function useCatalogDropdown(
  fetcher: (search: string) => Promise<PaginatedResponse<CatalogDropdownRow>>,
) {
  const searchTerm = ref('');
  const items = ref<CatalogDropdownRow[]>([]);
  const loading = ref(false);

  async function load(term: string) {
    loading.value = true;
    try {
      const res = await fetcher(term);
      items.value = res.results ?? [];
    } catch (e) {
      console.error(e);
      items.value = [];
    } finally {
      loading.value = false;
    }
  }

  watchDebounced(
    searchTerm,
    (term) => {
      void load(term);
    },
    { debounce: 300, immediate: true },
  );

  return { searchTerm, items, loading };
}
