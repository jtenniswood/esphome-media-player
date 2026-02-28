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
  // Use production URL when on localhost so the installer can load the manifest (not in repo; deployed to GitHub Pages)
  const manifestUrl =
    typeof window !== 'undefined' && window.location?.hostname === 'localhost'
      ? 'https://jtenniswood.github.io/esphome-media-player/firmware/media-player.manifest.json'
      : './firmware/media-player.manifest.json'
  btn.setAttribute('manifest', manifestUrl)
  const unsupported = document.createElement('span')
  unsupported.slot = 'unsupported'
  unsupported.innerHTML = '<strong>Your browser does not support installing things on ESP devices. Use Google Chrome or Microsoft Edge.</strong>'
  btn.appendChild(unsupported)
  container.value.appendChild(btn)
})
</script>

<template>
  <div ref="container" class="install-button-wrapper"></div>
</template>
