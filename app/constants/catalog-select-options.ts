export const CLIENT_TYPE_OPTIONS = [
  { label: 'Contado', value: 'CASH' },
  { label: 'Crédito', value: 'CREDIT' },
] as const;

export const BILLING_TYPE_OPTIONS = [
  { label: 'Factura directa', value: 'DIRECT_INVOICE' },
  { label: 'Manual', value: 'MANUAL' },
] as const;

export const COMMISSION_TYPE_OPTIONS = [
  { label: 'Porcentaje', value: 'PERCENTAGE' },
  { label: 'Fijo', value: 'FIXED' },
] as const;
