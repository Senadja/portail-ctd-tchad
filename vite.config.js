import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@admin': path.resolve(__dirname, './src/admin'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5015',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5015',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
