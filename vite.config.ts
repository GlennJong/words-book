import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDemo = mode === 'demo';
  return {
    base: './',
    plugins: [react()],
    resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        }
    },
    build: {
      outDir: isDemo ? 'dist/demo' : 'dist'
    },
    define: {
      'import.meta.env.VITE_IS_DEMO': JSON.stringify(isDemo)
    }
  }
})
