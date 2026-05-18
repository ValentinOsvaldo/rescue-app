<script setup lang="ts">
import type { RescueServiceType } from '~/interfaces/rescue';
import { RESCUE_SERVICE_TYPE_OPTIONS } from '~/constants/rescue-select-options';

const model = defineModel<RescueServiceType>({ required: true });
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <UButton
      v-for="option in RESCUE_SERVICE_TYPE_OPTIONS"
      :key="option.value"
      type="button"
      size="xl"
      class="flex h-auto min-h-24 flex-col items-center justify-center gap-2 py-4"
      :variant="model === option.value ? 'solid' : 'outline'"
      :color="model === option.value ? 'primary' : 'neutral'"
      @click="model = option.value"
    >
      <UIcon :name="option.icon" class="size-8" />
      <span class="text-center text-sm font-medium leading-tight">
        {{ option.label }}
      </span>
    </UButton>
  </div>
</template>
