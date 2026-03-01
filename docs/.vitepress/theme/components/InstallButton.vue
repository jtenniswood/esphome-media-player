<script setup>
import { onMounted, ref, watch } from 'vue'

const devices = [
  { label: 'Guition ESP32-S3 4848S040 (4")', manifest: 'media-player-4848s040.manifest.json' },
  { label: 'Guition ESP32-P4 JC8012P4A1 (10.1")', manifest: 'media-player-jc8012p4a1.manifest.json' },
]

const selectedIndex = ref(0)
const container = ref(null)
let installBtn = null

function manifestUrl(filename) {
  const isLocalhost =
    typeof window !== 'undefined' && window.location?.hostname === 'localhost'
  const base = isLocalhost
    ? 'https://jtenniswood.github.io/esphome-media-player/firmware/'
    : './firmware/'
  return base + filename
}

onMounted(() => {
  if (!container.value) return

  const script = document.createElement('script')
  script.type = 'module'
  script.src = 'https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module'
  document.head.appendChild(script)

  installBtn = document.createElement('esp-web-install-button')
  installBtn.setAttribute('manifest', manifestUrl(devices[selectedIndex.value].manifest))

  const unsupported = document.createElement('span')
  unsupported.slot = 'unsupported'
  unsupported.innerHTML =
    '<strong>Your browser does not support installing things on ESP devices. Use Google Chrome or Microsoft Edge.</strong>'
  installBtn.appendChild(unsupported)

  container.value.appendChild(installBtn)
})

watch(selectedIndex, (idx) => {
  if (installBtn) {
    installBtn.setAttribute('manifest', manifestUrl(devices[idx].manifest))
  }
})
</script>

<template>
  <div class="install-button-wrapper">
    <div class="device-selector">
      <label for="device-select">Device:</label>
      <select id="device-select" v-model="selectedIndex">
        <option v-for="(device, idx) in devices" :key="idx" :value="idx">
          {{ device.label }}
        </option>
      </select>
    </div>
    <div ref="container"></div>
  </div>
</template>

<style scoped>
.device-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.device-selector label {
  font-weight: 600;
  white-space: nowrap;
}

.device-selector select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
  cursor: pointer;
}
</style>
