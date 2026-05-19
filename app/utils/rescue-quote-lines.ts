import type { RescueQuoteLine } from '~/interfaces/rescue';

export function createEmptyQuoteLine(): RescueQuoteLine {
  return {
    id: crypto.randomUUID(),
    service_id: null,
    service_label: '',
    quantity: 1,
    unit_cost: 0,
    contract_item_id: null,
  };
}

export function emptyQuoteLines(): RescueQuoteLine[] {
  return [createEmptyQuoteLine()];
}
