import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function fullReloadOnMockChanges(): Plugin {
  return {
    name: 'kurio:full-reload-on-mock-changes',
    apply: 'serve',
    hotUpdate({ file }) {
      if (!file.replaceAll('\\', '/').includes('/src/mocks/')) return
      this.environment.hot.send({ type: 'full-reload' })
      return []
    },
  }
}

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    fullReloadOnMockChanges(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: { path: '/__vite_hmr' },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
