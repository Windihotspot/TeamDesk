import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify' // 👈 add this

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    port: 3001, 
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true }) // 👈 add this
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})