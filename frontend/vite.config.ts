import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function rewriteApiPath(path: string): string {
  return path.replace(/^\/api/, '') || '/'
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: rewriteApiPath,
      },
      '/api/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
        rewrite: rewriteApiPath,
      },
    },
  },
  preview: {
    port: 4173,
  },
})
