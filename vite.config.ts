import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'https://app-test.b18a.io',
        changeOrigin: true,
      }
    }
  }
})