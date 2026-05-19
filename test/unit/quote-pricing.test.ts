import { describe, expect, it } from 'vitest';
import type { RescueCompanySettings } from '~/interfaces/rescue/company-settings';
import type { RescueQuoteLine } from '~/interfaces/rescue';
import {
  computeQuotePricing,
  roundQuoteMoney,
  type QuotePricingSummary,
} from '~/utils/quote-pricing';

function line(
  partial: Partial<RescueQuoteLine> & Pick<RescueQuoteLine, 'quantity' | 'unit_cost'>,
): RescueQuoteLine {
  return {
    id: partial.id ?? crypto.randomUUID(),
    service_id: partial.service_id ?? 1,
    service_label: partial.service_label ?? 'Servicio',
    quantity: partial.quantity,
    unit_cost: partial.unit_cost,
    contract_item_id: partial.contract_item_id ?? null,
  };
}

function expectAtMostTwoDecimals(value: number) {
  expect(value).toBe(roundQuoteMoney(value));
}

function expectAllMoneyRounded(result: QuotePricingSummary) {
  expectAtMostTwoDecimals(result.costSubtotal);
  expectAtMostTwoDecimals(result.subtotalLines);
  expectAtMostTwoDecimals(result.profit);
  expectAtMostTwoDecimals(result.commissionValueAdd);
  expectAtMostTwoDecimals(result.totalBeforeTax);
  expectAtMostTwoDecimals(result.ivaAmount);
  expectAtMostTwoDecimals(result.totalCharged);
  for (const row of result.lines) {
    expectAtMostTwoDecimals(row.costSubtotal);
    expectAtMostTwoDecimals(row.baseFinal);
    expectAtMostTwoDecimals(row.afterMultiplier);
    expectAtMostTwoDecimals(row.fixedShare);
    expectAtMostTwoDecimals(row.lineTotal);
  }
}

const baseSettings: RescueCompanySettings = {
  commissions: {
    commission_type: 'PERCENTAGE',
    commission_value: 5,
    commission_fixed: 500,
    price_multiplier: 1.1,
  },
  contract: {
    id: 1,
    notes: '',
    items: [
      {
        id: 10,
        service_id: 1,
        service_name: 'Grúa plana',
        price: 500,
        price_multiplier: 1,
        percentaje: 0,
        notes: '',
      },
      {
        id: 11,
        service_id: 1,
        service_name: 'Grúa plana',
        price: 750,
        price_multiplier: 1.5,
        percentaje: 10,
        notes: 'Premium',
      },
    ],
  },
};

describe('roundQuoteMoney', () => {
  it('rounds to two decimal places (half up)', () => {
    expect(roundQuoteMoney(177.77777777)).toBe(177.78);
    expect(roundQuoteMoney(177.774)).toBe(177.77);
    expect(roundQuoteMoney(1.005)).toBe(1.01);
  });
});

describe('computeQuotePricing', () => {
  it('applies multiplier and prorates commission_fixed on standard lines only', () => {
    const lines = [
      line({ quantity: 1, unit_cost: 500 }),
      line({ quantity: 1, unit_cost: 300 }),
      line({ quantity: 1, unit_cost: 200 }),
    ];

    const result = computeQuotePricing(lines, baseSettings, { ivaRate: 0 });

    expect(result.lines[0]!.lineTotal).toBe(800);
    expect(result.lines[1]!.lineTotal).toBe(480);
    expect(result.lines[2]!.lineTotal).toBe(320);
    expect(result.costSubtotal).toBe(1000);
    expect(result.subtotalLines).toBe(1600);
    expect(result.profit).toBe(600);
    expect(result.commissionValueAdd).toBe(30);
    expect(result.totalBeforeTax).toBe(1630);
    expectAllMoneyRounded(result);
  });

  it('computes commission_value as percentage of profit', () => {
    const lines = [
      line({ quantity: 1, unit_cost: 1000 }),
      line({ quantity: 1, unit_cost: 1000 }),
      line({ quantity: 1, unit_cost: 1000 }),
    ];
    const settings: RescueCompanySettings = {
      commissions: {
        commission_type: 'PERCENTAGE',
        commission_value: 5,
        commission_fixed: 200,
        price_multiplier: 1.1,
      },
      contract: null,
    };

    const result = computeQuotePricing(lines, settings, { ivaRate: 0 });

    expect(result.costSubtotal).toBe(3000);
    expect(result.subtotalLines).toBe(3500);
    expect(result.profit).toBe(500);
    expect(result.commissionValueAdd).toBe(25);
    expect(result.totalBeforeTax).toBe(3525);
    expectAllMoneyRounded(result);
  });

  it('skips company commissions for contract lines but includes global commission on profit', () => {
    const lines = [
      line({
        quantity: 3,
        unit_cost: 500,
        service_id: 1,
        contract_item_id: 10,
      }),
      line({ quantity: 1, unit_cost: 200, service_id: 2 }),
    ];

    const result = computeQuotePricing(lines, baseSettings, { ivaRate: 0 });

    expect(result.lines[0]!.isContractLine).toBe(true);
    expect(result.lines[0]!.lineTotal).toBe(1500);
    expect(result.lines[1]!.afterMultiplier).toBe(220);
    expect(result.lines[1]!.fixedShare).toBe(500);
    expect(result.lines[1]!.lineTotal).toBe(720);
    expect(result.costSubtotal).toBe(1700);
    expect(result.subtotalLines).toBe(2220);
    expect(result.profit).toBe(520);
    expect(result.commissionValueAdd).toBe(26);
    expectAllMoneyRounded(result);
  });

  it('adds fixed commission_value and iva on totalBeforeTax', () => {
    const lines = [line({ quantity: 1, unit_cost: 1000 })];
    const settings: RescueCompanySettings = {
      commissions: {
        commission_type: 'FIXED',
        commission_value: 100,
        commission_fixed: 0,
        price_multiplier: 1,
      },
      contract: null,
    };

    const result = computeQuotePricing(lines, settings);

    expect(result.subtotalLines).toBe(1000);
    expect(result.profit).toBe(0);
    expect(result.commissionValueAdd).toBe(100);
    expect(result.totalBeforeTax).toBe(1100);
    expect(result.ivaAmount).toBe(176);
    expect(result.totalCharged).toBe(1276);
    expectAllMoneyRounded(result);
  });

  it('returns zero percentage commission when profit is zero or negative', () => {
    const lines = [line({ quantity: 1, unit_cost: 1000 })];
    const settings: RescueCompanySettings = {
      commissions: {
        commission_type: 'PERCENTAGE',
        commission_value: 5,
        commission_fixed: 0,
        price_multiplier: 0.8,
      },
      contract: null,
    };

    const result = computeQuotePricing(lines, settings, { ivaRate: 0 });

    expect(result.subtotalLines).toBe(800);
    expect(result.profit).toBe(-200);
    expect(result.commissionValueAdd).toBe(0);
    expect(result.totalBeforeTax).toBe(800);
    expectAllMoneyRounded(result);
  });

  it('applies FIXED commission even when profit is zero', () => {
    const lines = [line({ quantity: 1, unit_cost: 500 })];
    const settings: RescueCompanySettings = {
      commissions: {
        commission_type: 'FIXED',
        commission_value: 100,
        commission_fixed: 0,
        price_multiplier: 1,
      },
      contract: null,
    };

    const result = computeQuotePricing(lines, settings, { ivaRate: 0 });

    expect(result.profit).toBe(0);
    expect(result.commissionValueAdd).toBe(100);
    expect(result.totalBeforeTax).toBe(600);
    expectAllMoneyRounded(result);
  });
});
