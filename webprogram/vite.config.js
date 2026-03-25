import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
  vue(),
  // Removed vite-plugin-vue-devtools to disable the floating dev widget/icon
  // If you need vue devtools during development, re-enable this plugin or
  // install the official browser extension instead.
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
