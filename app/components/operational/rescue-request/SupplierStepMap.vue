<script setup lang="ts">
import { GoogleMap, AdvancedMarker, PinElement } from 'vue3-google-map';
import type { SupplierMapPin } from '~/interfaces/rescue';
import { parseRescueCoord } from '~/schemas/rescue-create';
import { fitMapToPoints } from '~/utils/map-bounds';

const props = defineProps<{
  unitLatitude: string | null;
  unitLongitude: string | null;
  selectedSupplier: SupplierMapPin | null;
}>();

const config = useRuntimeConfig();
const mapId = '21013da77446513d35236d00';

const DEFAULT_CENTER = { lat: 19.432608, lng: -99.133209 };

const mapRef = ref<{ map: google.maps.Map } | null>(null);

const unitPosition = computed(() => {
  const lat = parseRescueCoord(props.unitLatitude);
  const lng = parseRescueCoord(props.unitLongitude);
  if (lat == null || lng == null) return null;
  return { lat, lng };
});

const supplierPosition = computed(() => {
  if (!props.selectedSupplier) return null;
  return {
    lat: props.selectedSupplier.lat,
    lng: props.selectedSupplier.lng,
  };
});

const mapCenter = computed(() => {
  return unitPosition.value ?? supplierPosition.value ?? DEFAULT_CENTER;
});

const mapZoom = computed(() => {
  if (unitPosition.value && supplierPosition.value) return 12;
  if (unitPosition.value || supplierPosition.value) return 14;
  return 11;
});

function collectVisiblePoints(): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  if (unitPosition.value) points.push(unitPosition.value);
  if (supplierPosition.value) points.push(supplierPosition.value);
  return points;
}

function animateToMarkers() {
  const map = mapRef.value?.map;
  if (!map) return;
  const points = collectVisiblePoints();
  if (points.length === 0) {
    map.panTo(DEFAULT_CENTER);
    map.setZoom(11);
    return;
  }
  fitMapToPoints(map, points);
}

function onMapIdle() {
  animateToMarkers();
}

watch(
  () => [unitPosition.value, supplierPosition.value] as const,
  () => {
    nextTick(() => animateToMarkers());
  },
  { deep: true },
);
</script>

<template>
  <div class="h-full min-h-72 overflow-hidden rounded-lg border border-default">
    <div
      v-if="!config.public.googleMapsApiKey"
      class="flex h-full min-h-72 items-center justify-center px-4 text-sm text-muted"
    >
      Configura `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` para ver el mapa.
    </div>
    <ClientOnly v-else>
      <GoogleMap
        ref="mapRef"
        :map-id="mapId"
        :api-key="config.public.googleMapsApiKey"
        :center="mapCenter"
        :zoom="mapZoom"
        gesture-handling="greedy"
        class="h-full min-h-72 w-full"
        :map-type-control="false"
        :street-view-control="false"
        @idle="onMapIdle"
      >
        <AdvancedMarker
          v-if="unitPosition"
          :options="{ position: unitPosition, title: 'Ubicación de la unidad' }"
        >
          <template #content>
            <PinElement
              :background="'#2563eb'"
              :border-color="'#1d4ed8'"
              :glyph-color="'#ffffff'"
            />
          </template>
        </AdvancedMarker>

        <AdvancedMarker
          v-if="supplierPosition && selectedSupplier"
          :options="{
            position: supplierPosition,
            title: selectedSupplier.name,
          }"
        >
          <template #content>
            <PinElement
              :background="'#16a34a'"
              :border-color="'#15803d'"
              :glyph-color="'#ffffff'"
            />
          </template>
        </AdvancedMarker>
      </GoogleMap>
    </ClientOnly>
  </div>
</template>
