import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/app'
import { env } from '@/lib/env'
import { markNetworkReady } from '@/lib/network-ready'
import '@/styles/globals.css'

async function enableMocks() {
  if (!env.VITE_ENABLE_MOCKS) return
  const { startMockWorker } = await import('@/mocks/browser')
  await startMockWorker()
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

void enableMocks().finally(markNetworkReady)

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
