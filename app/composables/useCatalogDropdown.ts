import { useQuery } from '@pinia/colada';
import { watchDebounced } from '@vueuse/core';
import type { CatalogDropdownRow } from '~/interfaces/shared/catalog-dropdown.interface';
import type { PaginatedResponse } from '~/interfaces/shared/pagination.interface';

export type CatalogDropdownFetchOptions = { signal?: AbortSignal };

export type CatalogDropdownFetcher = (
  search: string,
  options?: CatalogDropdownFetchOptions,
) => Promise<PaginatedResponse<CatalogDropdownRow>>;

export function useCatalogDropdown(fetcher: CatalogDropdownFetcher) {
  const instanceId = useId();
  const searchTerm = ref('');
  const debouncedSearch = ref('');

  watchDebounced(
    searchTerm,
    (term) => {
      debouncedSearch.value = term;
    },
    { debounce: 300, immediate: true },
  );

  const { data, asyncStatus, error } = useQuery({
    key: () => ['catalog-dropdown', instanceId, debouncedSearch.value],
    query: async ({ signal }) => fetcher(debouncedSearch.value, { signal }),
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const items = computed(() => data.value?.results ?? []);
  const loading = computed(() => asyncStatus.value === 'loading');
  const errorMessage = computed(() =>
    error.value != null ? getFetchErrorMessage(error.value) : '',
  );

  return { searchTerm, items, loading, errorMessage };
}
