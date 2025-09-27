import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://go-crud.up.railway.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1')
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts']
  }
})
