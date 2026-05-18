<script setup lang="ts">
import type { RescueRequestFormState } from '~/schemas/rescue-create';
import type { CatalogDropdownFetcher } from '~/composables/useCatalogDropdown';
import { showsGestorInStepOne } from '~/utils/rescue-request';

const state = defineModel<RescueRequestFormState>({ required: true });

defineProps<{
  fetchClientDropdown: CatalogDropdownFetcher;
  fetchManagerDropdown: CatalogDropdownFetcher;
}>();

const showGestor = computed(() => showsGestorInStepOne(state.value.service_type));
</script>

<template>
  <div class="space-y-4">
    <UFormField label="Tipo de solicitud" name="service_type">
      <OperationalRescueRequestServiceTypePicker v-model="state.service_type" />
    </UFormField>

    <UFormField label="Cliente" name="client">
      <CatalogDropdownSelect
        v-model="state.client"
        placeholder="Buscar cliente"
        :fetcher="fetchClientDropdown"
      />
    </UFormField>

    <UFormField name="general_public">
      <UCheckbox
        v-model="state.general_public"
        label="Público en general"
      />
    </UFormField>

    <UFormField label="Número económico" name="serialNumber">
      <UInput v-model="state.serialNumber" class="w-full" />
    </UFormField>

    <UFormField
      v-if="showGestor"
      label="Gestor"
      name="manager"
    >
      <CatalogDropdownSelect
        v-model="state.manager"
        placeholder="Buscar gestor"
        :fetcher="fetchManagerDropdown"
      />
    </UFormField>
  </div>
</template>
