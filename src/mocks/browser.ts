import { setupWorker } from 'msw/browser'
import { mockControl } from '@/mocks/control'
import { initDb } from '@/mocks/db'
import { resumePendingOrders } from '@/mocks/domain/orders'
import { handlers } from '@/mocks/handlers'
import { isScenarioId, setScenario } from '@/mocks/scenarios'

export const worker = setupWorker(...handlers)

async function resetFromUrl() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('reset')) return
  await mockControl.reset()
  const scenario = url.searchParams.get('scenario')
  if (scenario && isScenarioId(scenario)) setScenario(scenario)
  url.searchParams.delete('reset')
  window.history.replaceState(null, '', url)
}

export async function startMockWorker() {
  await initDb()
  await resetFromUrl()
  resumePendingOrders()
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: import.meta.env.PROD,
  })
  window.__kurioMock = mockControl
}
