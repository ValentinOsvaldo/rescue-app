import type { RescueServiceType } from '~/interfaces/rescue';

export const RESCUE_SERVICE_TYPE_OPTIONS: {
  label: string;
  value: RescueServiceType;
  icon: string;
}[] = [
  { label: 'Rescate', value: 'rescue', icon: 'i-lucide-truck' },
  { label: 'Préstamo', value: 'loan', icon: 'i-lucide-landmark' },
  { label: 'Proyecto', value: 'proyect', icon: 'i-lucide-briefcase' },
  { label: 'Cotización', value: 'direct_budget', icon: 'i-lucide-file-text' },
];

export const RESCUE_SUPPLIER_SORT_OPTIONS: {
  label: string;
  value: import('~/interfaces/rescue').RescueSupplierSort;
}[] = [
  { label: 'Distancia', value: 'distance' },
  { label: 'Ranking', value: 'ranking' },
  { label: 'Nombre', value: 'name' },
];
