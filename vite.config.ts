import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  build: {
    sourcemap: true, // Para debugging en producción
    chunkSizeWarningLimit: 1600,
  },
  server: {
    host: true,
    port: 3000,
  },
})