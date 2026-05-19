import { describe, expect, it } from 'vitest';
import type { RescueCompanySettings } from '~/interfaces/rescue/company-settings';
import type { RescueQuoteLine } from '~/interfaces/rescue';
import { computeQuotePricing } from '~/utils/quote-pricing';

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

describe('computeQuotePricing', () => {
  it('applies multiplier and prorates commission_fixed on standard lines only', () => {
    const lines = [
      line({ quantity: 1, unit_cost: 500 }),
      line({ quantity: 1, unit_cost: 300 }),
      line({ quantity: 1, unit_cost: 200 }),
    ];

    const result = computeQuotePricing(lines, baseSettings, { ivaRate: 0 });

    const afterMult = [550, 330, 220];
    const pool = 1100;
    expect(result.lines[0]!.lineTotal).toBeCloseTo(afterMult[0]! + 500 * (afterMult[0]! / pool));
    expect(result.lines[1]!.lineTotal).toBeCloseTo(afterMult[1]! + 500 * (afterMult[1]! / pool));
    expect(result.lines[2]!.lineTotal).toBeCloseTo(afterMult[2]! + 500 * (afterMult[2]! / pool));
    expect(result.subtotalLines).toBeCloseTo(1600);
    expect(result.commissionValueAdd).toBeCloseTo(80);
    expect(result.totalBeforeTax).toBeCloseTo(1680);
  });

  it('skips company commissions for contract lines but includes them in global commission', () => {
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
    expect(result.lines[1]!.afterMultiplier).toBeCloseTo(220);
    expect(result.lines[1]!.fixedShare).toBeCloseTo(500);
    expect(result.subtotalLines).toBeCloseTo(2220);
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
    expect(result.commissionValueAdd).toBe(100);
    expect(result.totalBeforeTax).toBe(1100);
    expect(result.ivaAmount).toBeCloseTo(176);
    expect(result.totalCharged).toBeCloseTo(1276);
  });
});
