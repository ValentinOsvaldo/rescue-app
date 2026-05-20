<script setup lang="ts">
import { COMMISSION_TYPE_OPTIONS } from '~/constants/catalog-select-options';
import { DEFAULT_IVA_RATE, QUOTE_SUMMARY_LABELS } from '~/constants/quote-pricing';
import type { RescueCompanySettings } from '~/interfaces/rescue/company-settings';
import {
  isFilledQuoteLine,
  type QuoteLinePricing,
  type QuotePricingSummary,
} from '~/utils/quote-pricing';

const props = defineProps<{
  pricing: QuotePricingSummary;
  settings: RescueCompanySettings | null;
  ivaRate?: number;
}>();

const ivaRate = computed(() => props.ivaRate ?? DEFAULT_IVA_RATE);
const ivaPercentLabel = computed(() => formatIvaPercent(ivaRate.value));

const commissionTypeLabel = computed(() => {
  const type = props.settings?.commissions.commission_type;
  if (type == null) return '—';
  return (
    COMMISSION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
  );
});

const standardAfterMultSum = computed(() =>
  props.pricing.lines
    .filter((row) => isFilledQuoteLine(row.line) && !row.isContractLine)
    .reduce((sum, row) => sum + row.afterMultiplier, 0),
);

function fixedShareExplanation(row: QuoteLinePricing): string | null {
  if (row.isContractLine || row.fixedShare <= 0 || !props.settings) {
    return null;
  }
  const pool = props.settings.commissions.commission_fixed;
  const sum = standardAfterMultSum.value;
  if (sum <= 0) return null;
  const pct = ((row.afterMultiplier / sum) * 100).toFixed(1);
  return `Parte de la comisión fija total de la cotización (${formatQuoteMoney(pool)}): esta partida pesa ${pct}% del subtotal tras multiplicador → ${formatQuoteMoney(row.fixedShare)}`;
}

const commissionFormula = computed(() => {
  const commissions = props.settings?.commissions;
  if (commissions == null) return 'Sin ajustes de cliente cargados.';
  if (commissions.commission_type === 'FIXED') {
    return `Fija: se suma ${formatQuoteMoney(commissions.commission_value)} al subtotal antes de IVA.`;
  }
  if (props.pricing.profit <= 0) {
    return `Porcentaje ${commissions.commission_value}% de la utilidad → $0 (no se suma al total del cliente).`;
  }
  return `Porcentaje ${commissions.commission_value}% de la utilidad ${formatQuoteMoney(props.pricing.profit)} = ${formatQuoteMoney(props.pricing.sellerCommission)} (referencia; no se suma al total del cliente).`;
});

const beforeTaxFormula = computed(() => {
  if (props.pricing.sellerCommissionAddsToTotal) {
    return `${QUOTE_SUMMARY_LABELS.subtotal} + comisión fija vendedor`;
  }
  return QUOTE_SUMMARY_LABELS.subtotal;
});
</script>

<template>
  <details
    class="mt-4 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 text-xs"
  >
    <summary
      class="cursor-pointer select-none px-3 py-2 font-semibold text-amber-600 dark:text-amber-400"
    >
      Desglose de cotización (solo desarrollo)
    </summary>

    <div class="space-y-3 border-t border-amber-500/20 px-3 pb-3 pt-2">
      <section v-if="settings" class="space-y-1">
        <p class="font-medium text-muted">
          Ajustes del cliente
        </p>
        <ul class="list-inside list-disc space-y-0.5 text-muted">
          <li>
            Tipo comisión vendedor:
            <strong class="text-default">{{ commissionTypeLabel }}</strong>
            ({{ settings.commissions.commission_type }})
          </li>
          <li>
            Valor comisión:
            <strong class="tabular-nums text-default">
              {{ settings.commissions.commission_value }}
            </strong>
            <span v-if="settings.commissions.commission_type === 'PERCENTAGE'">
              %
            </span>
          </li>
          <li>
            Comisión fija total de la cotización (se reparte entre partidas):
            <strong class="tabular-nums text-default">
              {{ formatQuoteMoney(settings.commissions.commission_fixed) }}
            </strong>
          </li>
          <li>
            Multiplicador de precio:
            <strong class="tabular-nums text-default">
              {{ settings.commissions.price_multiplier }}
            </strong>
          </li>
          <li v-if="settings.contract">
            Convenio #{{ settings.contract.id }} ({{
              settings.contract.items.length
            }}
            ítems)
          </li>
        </ul>
      </section>
      <p v-else class="text-muted">
        Sin ajustes del cliente en memoria.
      </p>

      <section v-if="pricing.lines.length > 0" class="space-y-2">
        <p class="font-medium text-muted">
          Por línea
        </p>
        <div
          v-for="row in pricing.lines"
          :key="row.line.id"
          class="rounded border border-default/60 bg-elevated/30 p-2"
        >
          <p class="font-medium">
            {{
              row.line.service_label
                || (row.line.service_id
                  ? `Servicio #${row.line.service_id}`
                  : 'Sin servicio')
            }}
            <UBadge
              v-if="row.isContractLine"
              class="ml-1"
              color="primary"
              variant="subtle"
              size="xs"
              label="Convenio"
            />
          </p>
          <ul
            v-if="isFilledQuoteLine(row.line)"
            class="mt-1 space-y-0.5 tabular-nums text-muted"
          >
            <li>
              Cantidad × pago unitario → base:
              {{ row.line.quantity }} ×
              {{ formatQuoteMoney(row.line.unit_cost) }} =
              {{ formatQuoteMoney(row.baseFinal) }}
            </li>
            <li v-if="!row.isContractLine">
              Tras multiplicador:
              {{ formatQuoteMoney(row.afterMultiplier) }}
            </li>
            <li v-if="fixedShareExplanation(row)">
              {{ fixedShareExplanation(row) }}
            </li>
            <li v-if="row.isContractLine">
              Línea convenio: sin multiplicador ni comisión fija de empresa
            </li>
            <li>
              {{ QUOTE_SUMMARY_LABELS.technicalCost }} línea:
              {{ formatQuoteMoney(row.costSubtotal) }}
            </li>
            <li>
              Total calculado:
              {{ formatQuoteMoney(row.lineTotalCalculated) }}
            </li>
            <li v-if="row.roundingAdd !== 0">
              Redondeo al diez:
              {{ row.roundingAdd > 0 ? '+' : ''
              }}{{ formatQuoteMoney(row.roundingAdd) }}
            </li>
            <li>
              Total línea ({{ QUOTE_SUMMARY_LABELS.subtotal }} partida):
              <strong class="text-default">
                {{ formatQuoteMoney(row.lineTotal) }}
              </strong>
            </li>
          </ul>
          <p v-else class="mt-1 text-muted">
            Sin servicio: no se aplican comisiones ni totales.
          </p>
        </div>
      </section>

      <section class="space-y-1 border-t border-default/60 pt-2">
        <p class="font-medium text-muted">
          Totales
        </p>
        <ul class="space-y-0.5 tabular-nums text-muted">
          <li>
            {{ QUOTE_SUMMARY_LABELS.technicalCost }} = Σ costo línea →
            <strong class="text-default">
              {{ formatQuoteMoney(pricing.costSubtotal) }}
            </strong>
          </li>
          <li>
            {{ QUOTE_SUMMARY_LABELS.subtotal }} = Σ total línea →
            <strong class="text-default">
              {{ formatQuoteMoney(pricing.subtotalLines) }}
            </strong>
          </li>
          <li v-if="pricing.roundingAddTotal !== 0">
            Σ ajuste redondeo al diez →
            <strong class="text-default">
              {{ pricing.roundingAddTotal > 0 ? '+' : ''
              }}{{ formatQuoteMoney(pricing.roundingAddTotal) }}
            </strong>
          </li>
          <li>
            {{ QUOTE_SUMMARY_LABELS.utility }} = subtotal − costo técnico →
            <strong class="text-default">
              {{ formatQuoteMoney(pricing.profit) }}
            </strong>
          </li>
          <li>
            Comisión vendedor: {{ commissionFormula }}
          </li>
          <li>
            {{ QUOTE_SUMMARY_LABELS.beforeTax }} = {{ beforeTaxFormula }} →
            <strong class="text-default">
              {{ formatQuoteMoney(pricing.totalBeforeTax) }}
            </strong>
          </li>
          <li>
            IVA {{ ivaPercentLabel }} →
            <strong class="text-default">
              {{ formatQuoteMoney(pricing.ivaAmount) }}
            </strong>
          </li>
          <li>
            {{ QUOTE_SUMMARY_LABELS.totalQuoted }} →
            <strong class="text-primary">
              {{ formatQuoteMoney(pricing.totalCharged) }}
            </strong>
          </li>
        </ul>
      </section>
    </div>
  </details>
</template>
