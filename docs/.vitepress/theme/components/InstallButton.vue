<template>
  <div class="esp-install-selector">
    <div v-if="showSelector" class="device-list" role="listbox" aria-label="Target install device">
      <button
        v-for="availableDevice in visibleDevices"
        :key="availableDevice.key"
        type="button"
        class="device-card"
        :class="{ selected: selected.key === availableDevice.key }"
        role="option"
        :aria-selected="selected.key === availableDevice.key"
        @click="selectDevice(availableDevice)"
      >
        <span
          class="device-screen"
          :class="availableDevice.shape"
          :style="{
            '--screen-aspect': availableDevice.aspect,
            '--grid-cols': availableDevice.cols,
            '--grid-rows': availableDevice.rows
          }"
          aria-hidden="true"
        >
          <span class="screen-grid">
            <span v-for="slot in availableDevice.slots" :key="slot"></span>
          </span>
        </span>
        <span class="device-copy">
          <span class="device-name">{{ availableDevice.size }}</span>
          <span class="device-meta">{{ availableDevice.label }} - {{ availableDevice.resolution }}</span>
          <span class="device-tags">
            <span>{{ availableDevice.orientation }}</span>
            <span>{{ availableDevice.layout }}</span>
          </span>
        </span>
        <span class="device-check" aria-hidden="true"></span>
      </button>
    </div>

    <div class="installer-actions">
      <div v-if="!checked" class="installer-status">
        Preparing installer...
      </div>
      <div v-else-if="!supported" class="installer-status warning">
        Your browser does not support WebSerial. Use Chrome or Edge on desktop.
      </div>
      <div v-else-if="loadError" class="installer-status warning">
        Failed to load installer. {{ loadError }}
      </div>
      <div v-else-if="!ready" class="installer-status">
        Loading installer...
      </div>
      <div v-else ref="buttonContainer" class="install-button"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  device: { type: String, default: null },
})

const allDevices = [
  {
    key: 'jc8012p4a1',
    label: 'JC8012P4A1',
    size: '10.1 in',
    resolution: '1280 x 800',
    orientation: 'Landscape',
    layout: 'Side-panel layout',
    slots: 20,
    cols: 5,
    rows: 4,
    aspect: '1280 / 800',
    shape: 'landscape',
    manifest: 'jc8012p4a1/manifest.json',
  },
  {
    key: 'p4-86-panel',
    label: 'P4 86 Panel',
    size: '4 in',
    resolution: '720 x 720',
    orientation: 'Square',
    layout: 'Full-screen layout',
    slots: 9,
    cols: 3,
    rows: 3,
    aspect: '1 / 1',
    shape: 'square',
    manifest: 'p4-86-panel/manifest.json',
  },
  {
    key: 'jc4880p443',
    label: 'JC4880P443',
    size: '4.3 in',
    resolution: '480 x 800',
    orientation: 'Portrait',
    layout: 'Portrait layout',
    slots: 6,
    cols: 2,
    rows: 3,
    aspect: '480 / 800',
    shape: 'portrait',
    manifest: 'jc4880p443/manifest.json',
  },
  {
    key: '4848s040',
    label: '4848S040',
    size: '4 in',
    resolution: '480 x 480',
    orientation: 'Square',
    layout: 'Full-screen layout',
    slots: 9,
    cols: 3,
    rows: 3,
    aspect: '1 / 1',
    shape: 'square',
    manifest: '4848s040/manifest.json',
  },
]

const visibleDevices = computed(() => {
  if (props.device) {
    const match = allDevices.filter((availableDevice) => availableDevice.key === props.device)
    return match.length ? match : allDevices
  }
  return allDevices
})

const selected = ref(visibleDevices.value[0])
const checked = ref(false)
const supported = ref(false)
const ready = ref(false)
const loadError = ref(null)
const buttonContainer = ref(null)

const showSelector = computed(() => visibleDevices.value.length > 1)
const manifestUrl = computed(() => withBase(`/firmware/${selected.value.manifest}`))

function selectDevice(availableDevice) {
  selected.value = availableDevice
}

function createButton() {
  if (!ready.value || !buttonContainer.value) return

  buttonContainer.value.innerHTML = ''

  const installButton = document.createElement('esp-web-install-button')
  installButton.setAttribute('manifest', manifestUrl.value)

  const activateButton = document.createElement('button')
  activateButton.slot = 'activate'
  activateButton.className = 'brand-button'
  activateButton.textContent = 'Install ESPHome Media Player'
  installButton.appendChild(activateButton)

  buttonContainer.value.appendChild(installButton)
}

onMounted(async () => {
  checked.value = true
  supported.value = 'serial' in navigator
  if (!supported.value) return

  try {
    await import('https://unpkg.com/esp-web-tools@10/dist/web/install-button.js')
    ready.value = true
    await nextTick()
    createButton()
  } catch (err) {
    loadError.value = err?.message || 'Network or script load error.'
  }
})

watch(selected, async () => {
  await nextTick()
  createButton()
})
</script>

<style scoped>
.esp-install-selector {
  margin: 1.5rem 0;
}

.device-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.device-card {
  position: relative;
  display: grid;
  grid-template-columns: 74px 1fr 22px;
  gap: 14px;
  align-items: center;
  width: 100%;
  min-height: 124px;
  padding: 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
}

.device-card:hover {
  border-color: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.device-card:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.device-card.selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.device-screen {
  display: grid;
  justify-self: center;
  width: 66px;
  aspect-ratio: var(--screen-aspect);
  padding: 5px;
  border: 2px solid color-mix(in srgb, var(--vp-c-text-1) 18%, transparent);
  border-radius: 7px;
  background: #121820;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.device-screen.portrait {
  width: 44px;
}

.device-screen.square {
  width: 58px;
}

.screen-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  grid-template-rows: repeat(var(--grid-rows), 1fr);
  gap: 2px;
}

.screen-grid span {
  min-width: 0;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.18);
}

.device-copy {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.device-name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.device-meta {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.3;
}

.device-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.device-tags span {
  padding: 2px 7px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
}

.device-check {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 50%;
}

.device-card.selected .device-check {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
}

.device-card.selected .device-check::after {
  width: 7px;
  height: 11px;
  border: solid var(--vp-c-white);
  border-width: 0 2px 2px 0;
  content: "";
  transform: rotate(45deg) translate(-1px, -1px);
}

.installer-actions {
  margin-top: 16px;
}

:deep(.brand-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 220px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: 20px;
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
  font-size: 14px;
  font-weight: 600;
  line-height: 38px;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 0.25s,
    border-color 0.25s,
    background-color 0.25s;
}

:deep(.brand-button:hover) {
  background-color: var(--vp-button-brand-hover-bg);
}

.installer-status {
  padding: 10px 14px;
  border-radius: 8px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.installer-status.warning {
  background-color: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
}

@media (max-width: 640px) {
  .device-list {
    grid-template-columns: 1fr;
  }

  .device-card {
    grid-template-columns: 64px 1fr 22px;
  }

  :deep(.brand-button) {
    width: 100%;
  }
}
</style>
