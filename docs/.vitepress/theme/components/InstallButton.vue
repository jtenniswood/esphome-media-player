<script setup>
import { onMounted, ref, computed } from 'vue'

const props = defineProps({
  device: { type: String, default: null },
})

const allDevices = [
  { key: '4848s040', label: 'Guition ESP32-S3 4848S040 (4")', manifest: 'media-player-4848s040.manifest.json' },
  { key: 'jc8012p4a1', label: 'Guition ESP32-P4 JC8012P4A1 (10.1")', manifest: 'media-player-jc8012p4a1.manifest.json' },
]

const visibleDevices = computed(() => {
  if (props.device) {
    const match = allDevices.filter((d) => d.key === props.device)
    return match.length ? match : allDevices
  }
  return allDevices
})

const containers = ref({})
const scriptLoaded = ref(false)

function manifestUrl(filename) {
  const isLocalhost =
    typeof window !== 'undefined' && window.location?.hostname === 'localhost'
  const base = isLocalhost
    ? 'https://jtenniswood.github.io/esphome-media-player/firmware/'
    : './firmware/'
  return base + filename
}

function createButton(device, el) {
  if (!el) return
  el.innerHTML = ''
  const btn = document.createElement('esp-web-install-button')
  btn.setAttribute('manifest', manifestUrl(device.manifest))

  const unsupported = document.createElement('span')
  unsupported.slot = 'unsupported'
  unsupported.innerHTML =
    '<strong>Your browser does not support installing things on ESP devices. Use Google Chrome or Microsoft Edge.</strong>'
  btn.appendChild(unsupported)

  el.appendChild(btn)
}

function setContainerRef(key) {
  return (el) => {
    containers.value[key] = el
  }
}

onMounted(() => {
  const script = document.createElement('script')
  script.type = 'module'
  script.src = 'https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module'
  script.onload = () => {
    scriptLoaded.value = true
    for (const device of visibleDevices.value) {
      createButton(device, containers.value[device.key])
    }
  }
  document.head.appendChild(script)
})
</script>

<template>
  <div class="install-button-wrapper">
    <div
      v-for="device in visibleDevices"
      :key="device.key"
      class="install-card"
      :class="{ single: visibleDevices.length === 1 }"
    >
      <div v-if="visibleDevices.length > 1" class="device-label">{{ device.label }}</div>
      <div :ref="setContainerRef(device.key)"></div>
    </div>
  </div>
</template>

<style scoped>
.install-button-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.install-card {
  flex: 1 1 280px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg-soft);
}

.install-card.single {
  border: none;
  background: none;
  padding: 0;
}

.device-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}
</style>
