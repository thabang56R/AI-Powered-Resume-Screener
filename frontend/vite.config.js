// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173, // default, but explicit is good

    proxy: {
      // All requests starting with /api go to backend on port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,           // useful in some local setups
        // Do NOT add rewrite unless your backend routes DO NOT have /api prefix
        // rewrite: (path) => path.replace(/^\/api/, ''),  ← comment out or remove
      },
    },
  },
})