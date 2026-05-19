import type {
  RescueCommissionType,
  RescueCompanySettings,
  RescueContractItem,
} from '~/interfaces/rescue/company-settings';
import type { RescueQuoteLine } from '~/interfaces/rescue';

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseCommissionType(value: unknown): RescueCommissionType {
  return value === 'FIXED' ? 'FIXED' : 'PERCENTAGE';
}

export function mapRescueCompanySettings(
  raw: Record<string, unknown>,
): RescueCompanySettings {
  const commissionsRaw = (raw.commissions ?? {}) as Record<string, unknown>;
  const contractRaw = raw.contract;

  let contract: RescueCompanySettings['contract'] = null;
  if (contractRaw && typeof contractRaw === 'object') {
    const c = contractRaw as Record<string, unknown>;
    const itemsRaw = Array.isArray(c.items) ? c.items : [];
    contract = {
      id: toNumber(c.id),
      notes: String(c.notes ?? ''),
      items: itemsRaw.map((item) => {
        const it = item as Record<string, unknown>;
        return {
          id: toNumber(it.id),
          service_id: toNumber(it.service_id),
          service_name: String(it.service_name ?? ''),
          price: toNumber(it.price),
          price_multiplier: toNumber(it.price_multiplier, 1),
          percentaje: toNumber(it.percentaje),
          notes: String(it.notes ?? ''),
        };
      }),
    };
  }

  return {
    commissions: {
      commission_type: parseCommissionType(commissionsRaw.commission_type),
      commission_value: toNumber(commissionsRaw.commission_value),
      commission_fixed: toNumber(commissionsRaw.commission_fixed),
      price_multiplier: toNumber(commissionsRaw.price_multiplier, 1),
    },
    contract,
  };
}

export function findContractItemsForService(
  settings: RescueCompanySettings | null | undefined,
  serviceId: number | null,
): RescueContractItem[] {
  if (settings?.contract == null || serviceId == null) return [];
  return settings.contract.items.filter((item) => item.service_id === serviceId);
}

export function getContractItemById(
  settings: RescueCompanySettings | null | undefined,
  contractItemId: number | null,
): RescueContractItem | undefined {
  if (settings?.contract == null || contractItemId == null) return undefined;
  return settings.contract.items.find((item) => item.id === contractItemId);
}

export function isContractLine(
  line: Pick<RescueQuoteLine, 'contract_item_id'>,
): boolean {
  return line.contract_item_id != null;
}

export function applyContractToLine(
  line: RescueQuoteLine,
  contractItem: RescueContractItem,
): void {
  line.contract_item_id = contractItem.id;
  line.service_id = contractItem.service_id;
  line.service_label = contractItem.service_name;
  line.unit_cost = contractItem.price;
}

export function clearContractFromLine(line: RescueQuoteLine): void {
  line.contract_item_id = null;
}
