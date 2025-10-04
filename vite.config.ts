import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  publicDir: 'src/public',
  base: process.env.NODE_ENV === 'production' ? '/codattaOnchainDataVerify/' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'https://app-test.b18a.io',
        changeOrigin: true,
      }
    }
  }
})