<script setup lang="ts">
import { GoogleMap } from 'vue3-google-map';

const config = useRuntimeConfig();
</script>

<template>
  <ClientOnly>
    <GoogleMap :api-key="config.public.googleMapsApiKey">
      <slot />
    </GoogleMap>
  </ClientOnly>
</template>