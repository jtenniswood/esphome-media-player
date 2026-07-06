<template>
  <ul v-if="currentDevice" class="purchase-links">
    <li>
      <strong>Panel:</strong>
      <a :href="currentDevice.purchase.url">{{ currentDevice.purchase.label }}</a>
      <span v-if="currentDevice.purchase.note"> {{ currentDevice.purchase.note }}</span>
    </li>
    <li v-for="link in accessories" :key="link.url">
      <strong>{{ link.label }}:</strong>
      <a :href="link.url">{{ link.source }}</a>
    </li>
  </ul>
</template>

<script setup>
import { computed } from 'vue'
import deviceCatalog from '../../../../product/devices.json'

const props = defineProps({
  device: { type: String, required: true },
})

const currentDevice = computed(() => deviceCatalog.devices.find((candidate) => (
  candidate.web_slug === props.device ||
  candidate.profile === props.device ||
  candidate.config === props.device
)))

const accessories = computed(() => currentDevice.value?.purchase?.accessories || [])
</script>

<style scoped>
.purchase-links {
  padding-left: 1.25rem;
}
</style>
