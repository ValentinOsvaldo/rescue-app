<script setup lang="ts">
interface Props {
  title: string;
}

defineProps<Props>();
</script>

<template>
  <UDashboardNavbar :title="title">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <UColorModeSwitch />
      <UButton color="neutral" icon="i-lucide-bell" variant="ghost" />
    </template>
  </UDashboardNavbar>
</template>
