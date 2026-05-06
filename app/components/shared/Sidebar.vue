<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Dashboard',
    icon: 'i-lucide-home',
    to: '/admin/dashboard',
  },
]);

const { user } = useUserSession();

const { mutate: logout } = useMutation({
  mutation: () => $fetch('/api/auth/logout', { method: 'POST' }),
  onSuccess: () => {
    navigateTo('/login');
  },
});
</script>

<template>
  <UDashboardSidebar collapsible resizable>
    <template #header>
      <h1>Hello</h1>
    </template>
    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        orientation="vertical"
        :items="items"
      />
    </template>

    <template #footer="{ collapsed }">
      <div class="flex flex-col gap-2 w-full">
        <UUser
          :name="collapsed ? undefined : user?.name"
          :description="collapsed ? undefined : user?.role"
          :avatar="{
            loading: 'lazy',
            src: 'https://github.com/benjamincanac.png',
          }"
          :ui="{
            name: 'capitalize'
          }"
        />

        <UButton
          color="neutral"
          class="w-full"
          variant="ghost"
          icon="i-lucide-log-out"
          :label="collapsed ? undefined : 'Cerrar sesión'"
          @click="() => logout()"
        />
      </div>
    </template>
  </UDashboardSidebar>
</template>
