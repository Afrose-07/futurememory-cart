import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    open: false,
    watch: {
      ignored: [
        '**/.wwebjs_auth/**',
        '**/.wwebjs_cache/**',
        '**/server/**'
      ]
    }
  }
})
