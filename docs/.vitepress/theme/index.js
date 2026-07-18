import { defineAsyncComponent, h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MigrationBanner from './components/MigrationBanner.vue'
import SupportButton from './components/SupportButton.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(MigrationBanner),
      'layout-bottom': () => h(SupportButton),
    })
  },
  enhanceApp({ app }) {
    app.component('InstallButton', defineAsyncComponent(() => import('./components/InstallButton.vue')))
    app.component('PurchaseLinks', defineAsyncComponent(() => import('./components/PurchaseLinks.vue')))
    app.component('SettingsReference', defineAsyncComponent(() => import('./components/SettingsReference.vue')))
    app.component('SupportedDevices', defineAsyncComponent(() => import('./components/SupportedDevices.vue')))
  },
}
