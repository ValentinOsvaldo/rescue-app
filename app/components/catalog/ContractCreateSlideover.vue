<script setup lang="ts">
import { useMutation, useQueryCache } from '@pinia/colada';
import type { CatalogDropdownRow } from '~/interfaces/shared/catalog-dropdown.interface';
import type { PaginatedResponse } from '~/interfaces/shared/pagination.interface';
import type { ContractCreateBody } from '~/interfaces/catalogs/contract';
import type { infer as ZodInfer } from 'zod';
import {
  contractCreateFormSchema,
  contractFormToApiBody,
} from '~/schemas/catalog-create';
import { mapContractDetailToForm } from '~/utils/catalog-detail-map';
import { getFetchErrorMessage } from '~/utils/fetch-error-message';

const toast = useToast();

type ContractLineState = {
  service?: number;
  price: string;
  price_multiplier: string;
  percentaje: string;
  notes: string;
};

type ContractFormState = {
  client?: number;
  notes: string;
  items: ContractLineState[];
};

const open = ref(false);
const editingId = ref<number | null>(null);
const detailPending = ref(false);

const isEdit = computed(() => editingId.value != null);

function emptyLine(): ContractLineState {
  return {
    price: '',
    price_multiplier: '',
    percentaje: '',
    notes: '',
  };
}

function emptyState(): ContractFormState {
  return {
    client: undefined,
    notes: '',
    items: [emptyLine()],
  };
}

const state = reactive(emptyState());

function resetForm() {
  Object.assign(state, emptyState());
}

function prepareCreate() {
  editingId.value = null;
  resetForm();
}

function applyContractDetail(m: ReturnType<typeof mapContractDetailToForm>) {
  state.client = m.client;
  state.notes = m.notes;
  state.items = m.items.map((line) => ({
    service: line.service,
    price: line.price,
    price_multiplier: line.price_multiplier,
    percentaje: line.percentaje,
    notes: line.notes,
  }));
}

async function loadDetail(id: number) {
  detailPending.value = true;
  try {
    const raw = await $fetch<Record<string, unknown>>(
      `/api/catalogue/contract/detail/${id}/`,
    );
    resetForm();
    applyContractDetail(mapContractDetailToForm(raw));
  } catch (e) {
    console.error(e);
    toast.add({
      title: 'No se pudo cargar el contrato',
      description: getFetchErrorMessage(e),
      color: 'error',
    });
  } finally {
    detailPending.value = false;
  }
}

async function openEdit(id: number) {
  editingId.value = id;
  resetForm();
  open.value = true;
  await loadDetail(id);
}

defineExpose({ openEdit });

watch(open, (v) => {
  if (!v) {
    editingId.value = null;
    resetForm();
  }
});

function fetchClientDropdown(name: string) {
  return $fetch<PaginatedResponse<CatalogDropdownRow>>(
    '/api/catalogue/client/dropdown/',
    { query: { name } },
  );
}

function fetchServiceDropdown(name: string) {
  return $fetch<PaginatedResponse<CatalogDropdownRow>>(
    '/api/catalogue/service/dropdown/',
    { query: { name } },
  );
}

function addRow() {
  state.items.push(emptyLine());
}

function removeRow(index: number) {
  if (state.items.length <= 1) return;
  state.items.splice(index, 1);
}

const queryCache = useQueryCache();

const { mutate, asyncStatus } = useMutation({
  mutation: ({ body, id }: { body: ContractCreateBody; id: number | null }) =>
    id != null
      ? $fetch(`/api/catalogue/contract/update/${id}/`, {
          method: 'PATCH',
          body,
        })
      : $fetch('/api/catalogue/contract/create/', { method: 'POST', body }),
  async onSuccess() {
    const wasEdit = editingId.value != null;
    toast.add({
      title: wasEdit ? 'Contrato actualizado' : 'Contrato creado',
      color: 'success',
    });
    await queryCache.invalidateQueries({ key: ['contracts'] });
    open.value = false;
    resetForm();
    editingId.value = null;
  },
  onError: (e) => {
    console.error(e);
    toast.add({
      title: 'No se pudo guardar',
      description: getFetchErrorMessage(e),
      color: 'error',
    });
  },
});

const formRef = ref<{ submit: () => Promise<void> } | null>(null);

function onSubmit(payload: {
  data: ZodInfer<typeof contractCreateFormSchema>;
}) {
  mutate({
    body: contractFormToApiBody(payload.data),
    id: editingId.value,
  });
}

function onFormError() {
  console.error('Validación de formulario de contrato');
}

function cancel() {
  open.value = false;
}

async function requestSubmit() {
  await formRef.value?.submit();
}
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="isEdit ? 'Editar contrato' : 'Nuevo contrato'"
  >
    <UButton icon="i-lucide-plus" label="Nuevo contrato" size="lg" @click="prepareCreate" />

    <template #body>
      <div v-if="detailPending && isEdit" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
      </div>
      <UForm
        v-show="!detailPending || !isEdit"
        ref="formRef"
        :schema="contractCreateFormSchema"
        :state="state"
        class="space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] pe-1"
        @submit="onSubmit"
        @error="onFormError"
      >
        <UFormField label="Cliente" name="client">
          <CatalogDropdownSelect
            v-model="state.client"
            placeholder="Buscar cliente"
            :fetcher="fetchClientDropdown"
          />
        </UFormField>

        <UFormField label="Notas" name="notes">
          <textarea
            v-model="state.notes"
            class="w-full min-h-20 rounded-lg border border-default px-3 py-2 text-sm bg-default"
            rows="3"
          />
        </UFormField>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Partidas</span>
            <UButton
              type="button"
              size="xs"
              variant="subtle"
              icon="i-lucide-plus"
              label="Añadir"
              @click="addRow"
            />
          </div>

          <div
            v-for="(row, index) in state.items"
            :key="index"
            class="rounded-lg border border-default p-3 space-y-3"
          >
            <div class="flex justify-between items-center">
              <span class="text-xs text-muted">Partida {{ index + 1 }}</span>
              <UButton
                v-if="state.items.length > 1"
                type="button"
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-trash"
                @click="removeRow(index)"
              />
            </div>
            <UFormField :name="`items.${index}.service`" label="Servicio">
              <CatalogDropdownSelect
                v-model="row.service"
                placeholder="Buscar servicio"
                :fetcher="fetchServiceDropdown"
              />
            </UFormField>
            <UFormField :name="`items.${index}.price`" label="Precio">
              <UInput v-model="row.price" class="w-full" placeholder="500.00" />
            </UFormField>
            <UFormField
              :name="`items.${index}.price_multiplier`"
              label="Multiplicador precio (opcional)"
            >
              <UInput v-model="row.price_multiplier" class="w-full" />
            </UFormField>
            <UFormField :name="`items.${index}.percentaje`" label="Porcentaje (opcional)">
              <UInput v-model="row.percentaje" class="w-full" />
            </UFormField>
            <UFormField :name="`items.${index}.notes`" label="Notas de partida">
              <UInput v-model="row.notes" class="w-full" />
            </UFormField>
          </div>
        </div>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton type="button" color="neutral" variant="subtle" label="Cancelar" @click="cancel" />
        <UButton
          type="button"
          label="Guardar"
          :loading="asyncStatus === 'loading' || (detailPending && isEdit)"
          :disabled="asyncStatus === 'loading' || (detailPending && isEdit)"
          @click="requestSubmit"
        />
      </div>
    </template>
  </USlideover>
</template>
