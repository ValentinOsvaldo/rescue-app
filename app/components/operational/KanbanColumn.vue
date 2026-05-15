<script setup lang="ts" generic="T">
interface Props<T> {
  title: string;
  items: T[];
}

defineProps<Props<T>>();
</script>

<template>
  <div
    class="flex h-full min-h-0 w-[280px] shrink-0 flex-col rounded-lg bg-muted/30 overflow-hidden"
  >
    <div
      class="sticky top-0 z-10 shrink-0 px-3 py-2.5 rounded-t-lg bg-default border-t-2 border-t-primary"
    >
      <div class="flex items-center justify-between">
        <span
          class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted truncate"
        >
          {{ title }}
        </span>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto space-y-2 bg-accented p-2">
      <slot v-for="(item, index) in items" :key="index" :item="item">
        <UCard>{{ index }}</UCard>
      </slot>
    </div>
  </div>
</template>
