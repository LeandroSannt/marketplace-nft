import type { NftUpdatedEvent } from '@/contracts/events'
import { db, persist, resetDb } from '@/mocks/db'
import { findNft } from '@/mocks/domain/catalog'
import { clearOrderTimers, settleOrder } from '@/mocks/domain/orders'
import { clearWalletConnections } from '@/mocks/domain/wallets'
import { resetNetworkState } from '@/mocks/lib/http'
import {
  broadcastNftUpdated,
  connectionCount,
  createNftUpdatedEvent,
  dropConnections,
  sendNftUpdated,
} from '@/mocks/realtime'
import {
  getScenario,
  isScenarioId,
  SCENARIOS,
  setScenario,
  type ScenarioId,
} from '@/mocks/scenarios'

const APP_STORAGE_PREFIX = 'kurio:'

interface NftChange {
  editionId?: string
  price?: string
  available?: number
}

function clearAppStorage() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of Object.keys(storage)) {
      if (key.startsWith(APP_STORAGE_PREFIX)) storage.removeItem(key)
    }
  }
}

function applyNftChange(nftId: string, change: NftChange) {
  const nft = findNft(nftId)
  if (!nft) throw new Error(`NFT ${nftId} not found`)
  const edition = change.editionId
    ? nft.editions.find((item) => item.id === change.editionId)
    : nft.editions[0]
  if (!edition) throw new Error(`Edition ${change.editionId ?? ''} not found`)
  if (change.price !== undefined) edition.price = change.price
  if (change.available !== undefined) edition.available = change.available
  nft.version += 1
  persist()
  return nft
}

export const mockControl = {
  scenarios: SCENARIOS,
  getScenario,
  setScenario(scenario: ScenarioId) {
    if (!isScenarioId(scenario)) throw new Error(`Unknown scenario ${String(scenario)}`)
    setScenario(scenario)
  },
  async reset() {
    clearOrderTimers()
    clearWalletConnections()
    resetNetworkState()
    await resetDb()
    clearAppStorage()
    setScenario('default')
    dropConnections()
  },
  expireSessions() {
    for (const session of db().sessions)
      session.expiresAt = new Date(Date.now() - 1000).toISOString()
    persist()
  },
  updateNft(nftId: string, change: NftChange, options: { silent?: boolean } = {}) {
    const nft = applyNftChange(nftId, change)
    return options.silent ? null : broadcastNftUpdated(nft)
  },
  emitStaleNftEvent(nftId: string, change: NftChange): NftUpdatedEvent {
    const nft = findNft(nftId)
    if (!nft) throw new Error(`NFT ${nftId} not found`)
    const snapshot = structuredClone(nft)
    const edition =
      snapshot.editions.find((item) => item.id === change.editionId) ?? snapshot.editions[0]
    if (edition && change.price !== undefined) edition.price = change.price
    if (edition && change.available !== undefined) edition.available = change.available
    snapshot.version = Math.max(0, nft.version - 1)
    const event = createNftUpdatedEvent(snapshot)
    sendNftUpdated(event)
    return event
  },
  replayNftEvent(event: NftUpdatedEvent) {
    sendNftUpdated(event)
  },
  dropConnections,
  connectionCount,
  settlePendingOrders() {
    for (const order of Object.values(db().orders)) {
      if (order.status === 'pending') settleOrder(order.id)
    }
  },
}

export type MockControl = typeof mockControl

declare global {
  interface Window {
    __kurioMock?: MockControl
  }
}
