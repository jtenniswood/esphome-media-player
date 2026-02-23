import { defineAsyncComponent } from 'vue'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('InstallButton', defineAsyncComponent(() => import('./components/InstallButton.vue')))
  },
}
