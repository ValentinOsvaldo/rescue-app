/** Provisional IVA rate until backend provides tax rules per client. */
export const DEFAULT_IVA_RATE = 0.16;

/** Decimal places for quote amounts in MXN (centavos). */
export const QUOTE_MONEY_DECIMALS = 2;

/** Round each line total up to the next $10 before summing (default on). */
export const DEFAULT_QUOTE_ROUND_TO_TEN = true;

export const QUOTE_SUMMARY_LABELS = {
  technicalCost: 'Costo técnico',
  subtotal: 'Subtotal',
  utility: 'Utilidad',
  sellerCommissionPercent: 'Comisión vendedor',
  sellerCommissionFixed: 'Comisión fija vendedor',
  beforeTax: 'Subtotal antes de IVA',
  totalQuoted: 'Total cotizado',
  roundingPerLine: 'Ajuste por redondeo al diez',
} as const;
