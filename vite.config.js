import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify()
  ],
  base: '/Shippit-Black-Ops/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/Shippit-Black-Ops/staging/': {
        target: 'https://app.staging.shippit.com/api/3',
        changeOrigin: true,
        rewrite: path => path.replace('/Shippit-Black-Ops/staging','')
      },
      '/Shippit-Black-Ops/production/': {
        target: 'https://app.shippit.com/api/3',
        changeOrigin: true,
        rewrite: path => path.replace('/Shippit-Black-Ops/production','')
      },
      '/Shippit-Black-Ops/auspost/': {
        target: 'https://digitalapi.auspost.com.au',
        changeOrigin: true,
        rewrite: path => path.replace('/Shippit-Black-Ops/auspost','')
      }
    }
  }
})
