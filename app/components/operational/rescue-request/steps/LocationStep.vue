<script setup lang="ts">
import type { RescueRequestFormState } from '~/schemas/rescue-create';

const state = defineModel<RescueRequestFormState>({ required: true });
</script>

<template>
  <div class="space-y-4">
    <UFormField label="Ubicación de la unidad" name="location_latitude">
      <SharedMapPinPicker
        v-model:latitude="state.location_latitude"
        v-model:longitude="state.location_longitude"
      />
    </UFormField>

    <UFormField label="Descripción del lugar" name="location_description">
      <UInput v-model="state.location_description" class="w-full" />
    </UFormField>

    <UFormField label="Descripción del servicio" name="service_description">
      <UTextarea
        v-model="state.service_description"
        class="w-full"
        :rows="4"
      />
    </UFormField>
  </div>
</template>
