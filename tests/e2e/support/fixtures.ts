import { test as base, expect, type Page } from '@playwright/test'

export const USERS = {
  ana: { email: 'colecionador@kurio.dev', password: 'Kurio2026', name: 'Ana Kurio' },
  bruno: { email: 'segundo@kurio.dev', password: 'Kurio2026', name: 'Bruno Lima' },
} as const

export type UserKey = keyof typeof USERS

export const HERO_NFT = {
  id: 'emerald-ape-042',
  name: 'Emerald Ape #042',
  standardEdition: 'emerald-ape-042-standard',
}

export type Scenario =
  | 'default'
  | 'slow-network'
  | 'server-error'
  | 'favorites-failure'
  | 'order-timeout'
  | 'payment-declined'
  | 'wallet-rejected'
  | 'wallet-disconnects'
  | 'session-expires-on-checkout'
  | 'variable-latency'

interface NftChange {
  editionId?: string
  price?: string
  available?: number
}

interface MockControl {
  setScenario: (scenario: Scenario) => void
  expireSessions: () => void
  updateNft: (nftId: string, change: NftChange, options?: { silent?: boolean }) => unknown
  emitStaleNftEvent: (nftId: string, change: NftChange) => unknown
  replayNftEvent: (event: unknown) => void
  dropConnections: () => void
  connectionCount: () => number
}

declare global {
  interface Window {
    __kurioMock?: MockControl
  }
}

const APP_BOOT_TIMEOUT_MS = 20_000

async function waitForApp(page: Page) {
  await page.waitForFunction(() => Boolean(window.__kurioMock), undefined, {
    timeout: APP_BOOT_TIMEOUT_MS,
  })
  await expect(page.locator('#conteudo')).toBeVisible({ timeout: APP_BOOT_TIMEOUT_MS })
}

export class App {
  constructor(readonly page: Page) {}

  async useScenario(scenario: Scenario) {
    await this.page.addInitScript((value) => {
      if (window.sessionStorage.getItem('e2e:scenario-applied')) return
      window.localStorage.setItem('kurio:mock:scenario', value)
      window.sessionStorage.setItem('e2e:scenario-applied', '1')
    }, scenario)
  }

  async goto(path: string) {
    await this.page.goto(path)
    await waitForApp(this.page)
  }

  async reload() {
    await this.page.reload()
    await waitForApp(this.page)
  }

  setScenario(scenario: Scenario) {
    return this.page.evaluate((value) => {
      window.__kurioMock?.setScenario(value)
    }, scenario)
  }

  expireSessions() {
    return this.page.evaluate(() => {
      window.__kurioMock?.expireSessions()
    })
  }

  updateNft(nftId: string, change: NftChange, options: { silent?: boolean } = {}) {
    return this.page.evaluate(
      ([id, value, extra]) => window.__kurioMock?.updateNft(id, value, extra),
      [nftId, change, options] as const,
    )
  }

  emitStaleNftEvent(nftId: string, change: NftChange) {
    return this.page.evaluate(([id, value]) => window.__kurioMock?.emitStaleNftEvent(id, value), [
      nftId,
      change,
    ] as const)
  }

  replayNftEvent(event: unknown) {
    return this.page.evaluate((value) => {
      window.__kurioMock?.replayNftEvent(value)
    }, event)
  }

  async waitForRealtime() {
    await expect
      .poll(() => this.page.evaluate(() => window.__kurioMock?.connectionCount() ?? 0))
      .toBeGreaterThan(0)
  }

  dropConnections() {
    return this.page.evaluate(() => {
      window.__kurioMock?.dropConnections()
    })
  }

  async loginViaApi(user: UserKey) {
    const credentials = USERS[user]
    await this.page.evaluate(async ({ email, password }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const session = (await response.json()) as { token: string; user: { id: string } }
      window.localStorage.setItem(
        'kurio:session',
        JSON.stringify({ token: session.token, userId: session.user.id }),
      )
    }, credentials)
    await this.reload()
  }

  async addToCartViaApi(nftId: string, editionId: string, quantity = 1) {
    await this.page.evaluate(
      async ({ nftId: id, editionId: edition, quantity: amount }) => {
        const raw = window.localStorage.getItem('kurio:session')
        const token = raw ? (JSON.parse(raw) as { token: string }).token : null
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`
        const guestCart = window.localStorage.getItem('kurio:guest-cart')
        if (!token && guestCart) headers['X-Cart-Id'] = guestCart
        const response = await fetch('/api/cart/items', {
          method: 'POST',
          headers,
          body: JSON.stringify({ nftId: id, editionId: edition, quantity: amount }),
        })
        const cart = (await response.json()) as { id: string }
        if (!token) window.localStorage.setItem('kurio:guest-cart', cart.id)
      },
      { nftId, editionId, quantity },
    )
  }

  ordersCount() {
    return this.page.evaluate(async () => {
      const raw = window.localStorage.getItem('kurio:session')
      if (!raw) return 0
      const { token } = JSON.parse(raw) as { token: string }
      const response = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      const body = (await response.json()) as { items: unknown[] }
      return body.items.length
    })
  }

  toast(text: string | RegExp) {
    return this.page.locator('[data-sonner-toast]').filter({ hasText: text })
  }
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    await use(new App(page))
  },
})

export { expect }
