import { DEFAULT_IVA_RATE } from '~/constants/quote-pricing';
import type { RescueCompanySettings } from '~/interfaces/rescue/company-settings';
import { isContractLine } from '~/utils/rescue-company-settings';
import type { RescueQuoteLine } from '~/interfaces/rescue';

export interface QuotePricingOptions {
  ivaRate?: number;
}

export interface QuoteLinePricing {
  line: RescueQuoteLine;
  isContractLine: boolean;
  costSubtotal: number;
  baseFinal: number;
  afterMultiplier: number;
  fixedShare: number;
  lineTotal: number;
}

export interface QuotePricingSummary {
  costSubtotal: number;
  subtotalLines: number;
  commissionValueAdd: number;
  totalBeforeTax: number;
  ivaAmount: number;
  totalCharged: number;
  lines: QuoteLinePricing[];
}

const DEFAULT_COMMISSIONS = {
  commission_type: 'PERCENTAGE' as const,
  commission_value: 0,
  commission_fixed: 0,
  price_multiplier: 1,
};

function lineBaseFinal(line: Pick<RescueQuoteLine, 'quantity' | 'unit_cost'>): number {
  const qty = Number.isFinite(line.quantity) ? line.quantity : 0;
  const unit = Number.isFinite(line.unit_cost) ? line.unit_cost : 0;
  return qty * unit;
}

function computeCommissionValueAdd(
  subtotalLines: number,
  settings: RescueCompanySettings | null | undefined,
): number {
  const commissions = settings?.commissions ?? DEFAULT_COMMISSIONS;
  if (commissions.commission_type === 'FIXED') {
    return commissions.commission_value;
  }
  return subtotalLines * (commissions.commission_value / 100);
}

export function computeQuotePricing(
  lines: RescueQuoteLine[],
  settings: RescueCompanySettings | null | undefined,
  options: QuotePricingOptions = {},
): QuotePricingSummary {
  const ivaRate = options.ivaRate ?? DEFAULT_IVA_RATE;
  const commissions = settings?.commissions ?? DEFAULT_COMMISSIONS;
  const priceMultiplier = commissions.price_multiplier;
  const commissionFixedPool = commissions.commission_fixed;

  const standardIndices: number[] = [];
  const rowDrafts: Array<{
    line: RescueQuoteLine;
    isContractLine: boolean;
    costSubtotal: number;
    baseFinal: number;
    afterMultiplier: number;
  }> = [];

  lines.forEach((line, index) => {
    const contractLine = isContractLine(line);
    const costSubtotal = lineBaseFinal(line);
    const baseFinal = costSubtotal;

    if (contractLine) {
      rowDrafts.push({
        line,
        isContractLine: true,
        costSubtotal,
        baseFinal,
        afterMultiplier: baseFinal,
      });
      return;
    }

    const afterMultiplier = baseFinal * priceMultiplier;
    rowDrafts.push({
      line,
      isContractLine: false,
      costSubtotal,
      baseFinal,
      afterMultiplier,
    });
    standardIndices.push(index);
  });

  const standardAfterMultSum = standardIndices.reduce(
    (sum, index) => sum + rowDrafts[index]!.afterMultiplier,
    0,
  );

  const pricingLines: QuoteLinePricing[] = rowDrafts.map((draft) => {
    if (draft.isContractLine) {
      return {
        line: draft.line,
        isContractLine: true,
        costSubtotal: draft.costSubtotal,
        baseFinal: draft.baseFinal,
        afterMultiplier: draft.afterMultiplier,
        fixedShare: 0,
        lineTotal: draft.baseFinal,
      };
    }

    const fixedShare =
      standardAfterMultSum > 0
        ? commissionFixedPool * (draft.afterMultiplier / standardAfterMultSum)
        : 0;

    return {
      line: draft.line,
      isContractLine: false,
      costSubtotal: draft.costSubtotal,
      baseFinal: draft.baseFinal,
      afterMultiplier: draft.afterMultiplier,
      fixedShare,
      lineTotal: draft.afterMultiplier + fixedShare,
    };
  });

  const costSubtotal = pricingLines.reduce((sum, row) => sum + row.costSubtotal, 0);
  const subtotalLines = pricingLines.reduce((sum, row) => sum + row.lineTotal, 0);
  const commissionValueAdd = computeCommissionValueAdd(subtotalLines, settings);
  const totalBeforeTax = subtotalLines + commissionValueAdd;
  const ivaAmount = totalBeforeTax * ivaRate;
  const totalCharged = totalBeforeTax + ivaAmount;

  return {
    costSubtotal,
    subtotalLines,
    commissionValueAdd,
    totalBeforeTax,
    ivaAmount,
    totalCharged,
    lines: pricingLines,
  };
}

/** @deprecated Use computeQuotePricing — kept for gradual migration */
export function computeQuoteLineTotals(
  line: Pick<RescueQuoteLine, 'quantity' | 'unit_cost' | 'contract_item_id'>,
  settings?: RescueCompanySettings | null,
): Pick<
  QuoteLinePricing,
  'costSubtotal' | 'lineTotal' | 'isContractLine' | 'fixedShare' | 'afterMultiplier'
> {
  const fullLine: RescueQuoteLine = {
    id: '',
    service_id: null,
    service_label: '',
    quantity: line.quantity,
    unit_cost: line.unit_cost,
    contract_item_id: line.contract_item_id ?? null,
  };
  const summary = computeQuotePricing([fullLine], settings);
  const row = summary.lines[0]!;
  return {
    costSubtotal: row.costSubtotal,
    lineTotal: row.lineTotal,
    isContractLine: row.isContractLine,
    fixedShare: row.fixedShare,
    afterMultiplier: row.afterMultiplier,
  };
}

/** @deprecated Use computeQuotePricing */
export function computeQuoteSummary(
  lines: RescueQuoteLine[],
  settings?: RescueCompanySettings | null,
  options?: QuotePricingOptions,
) {
  const pricing = computeQuotePricing(lines, settings, options);
  return {
    costSubtotal: pricing.costSubtotal,
    totalCharged: pricing.totalCharged,
    subtotalLines: pricing.subtotalLines,
    commissionValueAdd: pricing.commissionValueAdd,
    totalBeforeTax: pricing.totalBeforeTax,
    ivaAmount: pricing.ivaAmount,
    lines: pricing.lines.map((row) => ({
      line: row.line,
      costSubtotal: row.costSubtotal,
      lineTotal: row.lineTotal,
      isContractLine: row.isContractLine,
    })),
  };
}

export function formatQuoteMoney(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatIvaPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
