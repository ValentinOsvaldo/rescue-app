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

export const SUPPLIER_SERVICE_TYPE_OPTIONS = [
  { label: 'Grúas', value: 'cranes' },
  { label: 'Mecánica', value: 'mechanics' },
  { label: 'Auxilio Vial', value: 'road_assist' },
  { label: 'Montacargas', value: 'forklifts' },
  { label: 'Plataforma', value: 'flatbed' },
  { label: 'Transporte', value: 'transport' },
  { label: 'Otro', value: 'other' },
] as const;
