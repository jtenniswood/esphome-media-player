<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return
  const script = document.createElement('script')
  script.type = 'module'
  script.src = 'https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module'
  document.head.appendChild(script)
  const btn = document.createElement('esp-web-install-button')
  btn.setAttribute('manifest', './firmware/media-player.manifest.json')
  container.value.appendChild(btn)
})
</script>

<template>
  <div ref="container" class="install-button-wrapper"></div>
</template>
