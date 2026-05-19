import { DEFAULT_IVA_RATE, QUOTE_MONEY_DECIMALS } from '~/constants/quote-pricing';
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
  profit: number;
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

const MONEY_FACTOR = 10 ** QUOTE_MONEY_DECIMALS;

export function roundQuoteMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * MONEY_FACTOR) / MONEY_FACTOR;
}

function lineBaseFinal(line: Pick<RescueQuoteLine, 'quantity' | 'unit_cost'>): number {
  const qty = Number.isFinite(line.quantity) ? line.quantity : 0;
  const unit = Number.isFinite(line.unit_cost) ? line.unit_cost : 0;
  return qty * unit;
}

function computeProfit(subtotalLines: number, costSubtotal: number): number {
  return roundQuoteMoney(subtotalLines - costSubtotal);
}

function computeCommissionValueAdd(
  profit: number,
  settings: RescueCompanySettings | null | undefined,
): number {
  const commissions = settings?.commissions ?? DEFAULT_COMMISSIONS;
  if (commissions.commission_type === 'FIXED') {
    return roundQuoteMoney(commissions.commission_value);
  }
  if (profit <= 0) return 0;
  return roundQuoteMoney(profit * (commissions.commission_value / 100));
}

function distributeRoundedFixedShares(
  standardIndices: number[],
  rowDrafts: Array<{ afterMultiplier: number }>,
  standardAfterMultSum: number,
  commissionFixedPool: number,
): Map<number, number> {
  const shares = new Map<number, number>();
  if (standardIndices.length === 0) return shares;

  const poolRounded = roundQuoteMoney(commissionFixedPool);

  for (const index of standardIndices) {
    const draft = rowDrafts[index]!;
    const raw =
      standardAfterMultSum > 0
        ? commissionFixedPool * (draft.afterMultiplier / standardAfterMultSum)
        : 0;
    shares.set(index, roundQuoteMoney(raw));
  }

  const allocated = standardIndices.reduce(
    (sum, index) => sum + (shares.get(index) ?? 0),
    0,
  );
  const remainder = roundQuoteMoney(poolRounded - allocated);

  if (remainder !== 0) {
    const lastStandardIndex = standardIndices[standardIndices.length - 1]!;
    shares.set(
      lastStandardIndex,
      roundQuoteMoney((shares.get(lastStandardIndex) ?? 0) + remainder),
    );
  }

  return shares;
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

  const fixedShareByIndex = distributeRoundedFixedShares(
    standardIndices,
    rowDrafts,
    standardAfterMultSum,
    commissionFixedPool,
  );

  const pricingLines: QuoteLinePricing[] = rowDrafts.map((draft, index) => {
    if (draft.isContractLine) {
      const costSubtotal = roundQuoteMoney(draft.costSubtotal);
      return {
        line: draft.line,
        isContractLine: true,
        costSubtotal,
        baseFinal: costSubtotal,
        afterMultiplier: costSubtotal,
        fixedShare: 0,
        lineTotal: costSubtotal,
      };
    }

    const costSubtotal = roundQuoteMoney(draft.costSubtotal);
    const baseFinal = roundQuoteMoney(draft.baseFinal);
    const afterMultiplier = roundQuoteMoney(draft.afterMultiplier);
    const fixedShare = fixedShareByIndex.get(index) ?? 0;

    return {
      line: draft.line,
      isContractLine: false,
      costSubtotal,
      baseFinal,
      afterMultiplier,
      fixedShare,
      lineTotal: roundQuoteMoney(afterMultiplier + fixedShare),
    };
  });

  const costSubtotal = pricingLines.reduce((sum, row) => sum + row.costSubtotal, 0);
  const subtotalLines = pricingLines.reduce((sum, row) => sum + row.lineTotal, 0);
  const profit = computeProfit(subtotalLines, costSubtotal);
  const commissionValueAdd = computeCommissionValueAdd(profit, settings);
  const totalBeforeTax = roundQuoteMoney(subtotalLines + commissionValueAdd);
  const ivaAmount = roundQuoteMoney(totalBeforeTax * ivaRate);
  const totalCharged = roundQuoteMoney(totalBeforeTax + ivaAmount);

  return {
    costSubtotal,
    subtotalLines,
    profit,
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
    profit: pricing.profit,
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
    minimumFractionDigits: QUOTE_MONEY_DECIMALS,
    maximumFractionDigits: QUOTE_MONEY_DECIMALS,
  }).format(roundQuoteMoney(value));
}

export function formatIvaPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
