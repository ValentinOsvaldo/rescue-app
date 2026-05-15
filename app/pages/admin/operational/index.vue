<script setup lang="ts">
const rescueRequestModalRef = ref<{
  openCreate: () => void;
} | null>(null);
</script>

<template>
  <UDashboardPanel
    :ui="{
      body: 'flex flex-col min-h-0 flex-1 overflow-hidden bg-elevated dark:bg-default',
    }"
  >
    <template #header>
      <SharedNavbar title="Operacional" />
    </template>

    <template #body>
      <div class="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6">
        <div class="shrink-0 flex flex-col gap-4">
          <div>
            <UInput leading-icon="i-lucide-search" placeholder="Buscar folio" />
          </div>
          <div class="flex flex-row flex-wrap items-center justify-end gap-2">
            <UButton
              color="neutral"
              icon="i-lucide-eye"
              label="Columnas"
              variant="subtle"
            />

            <UFieldGroup>
              <UButton color="primary" icon="i-lucide-grid" variant="solid" />
              <UButton color="neutral" icon="i-lucide-list" variant="subtle" />
            </UFieldGroup>

            <UButton
              icon="i-lucide-plus"
              label="Nueva solicitud"
              @click="rescueRequestModalRef?.openCreate()"
            />
          </div>
        </div>

        <OperationalRescueRequestModal ref="rescueRequestModalRef" />

        <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div class="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
            <div class="flex h-full min-h-0 min-w-max gap-3 items-stretch">
              <OperationalKanbanColumn
                title="Solicitado"
                :items="[
                  {
                    id: 1,
                  },
                ]"
              >
                <template #default="{ item }">
                  <UCard>{{ item.id }}</UCard>
                </template>
              </OperationalKanbanColumn>
              <OperationalKanbanColumn title="Activo sin cotizar" :items="[]" />
              <OperationalKanbanColumn
                title="Pendiente de autorizar"
                :items="[]"
              />
              <OperationalKanbanColumn title="Esperando anticipo" :items="[]" />
              <OperationalKanbanColumn title="En proceso" :items="[]" />
              <OperationalKanbanColumn title="Cerrado no pagado" :items="[]" />
              <OperationalKanbanColumn title="Cerrado" :items="[]" />
              <OperationalKanbanColumn title="Garantía pendiente" :items="[]" />
              <OperationalKanbanColumn title="Cancelado" :items="[]" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
