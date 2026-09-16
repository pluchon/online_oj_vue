import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/dev-api': {
        target: 'http://127.0.0.1:19090',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/dev-api/, '')
      }
    }
  }
})
