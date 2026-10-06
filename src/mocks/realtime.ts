import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/contracts/events'
import { REALTIME_EVENTS } from '@/contracts/events'
import { nextEventSequence, persist, type OrderRecord } from '@/mocks/db'
import type { NftRecord } from '@/mocks/fixtures/nfts'
import { findSession, isSessionActive } from '@/mocks/lib/http'
import { getScenario } from '@/mocks/scenarios'
import { summarizeNft } from '@/mocks/domain/catalog'

const PING_INTERVAL_MS = 20_000
const HEARTBEAT_TIMEOUT_MS = PING_INTERVAL_MS * 2

interface Connection {
  userId: string | null
  emit: (event: string, payload: unknown) => void
  close: () => void
}

const connections = new Set<Connection>()

const socketLink = ws.link(`${window.location.origin.replace(/^http/, 'ws')}/`)

function readAuthToken(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.startsWith('40')) return null
  try {
    const payload = JSON.parse(raw.slice(2)) as { token?: unknown }
    return typeof payload.token === 'string' ? payload.token : null
  } catch {
    return null
  }
}

export const realtimeHandler = socketLink.addEventListener('connection', (connection) => {
  if (getScenario() === 'offline') {
    connection.client.close(1011, 'offline')
    return
  }

  const io = toSocketIo(connection)
  const entry: Connection = {
    userId: null,
    emit: (event, payload) => {
      io.client.emit(event, payload)
    },
    close: () => {
      connection.client.close(1012, 'server restart')
    },
  }
  connections.add(entry)
  let lastSeen = Date.now()

  const release = () => {
    window.clearInterval(heartbeat)
    connections.delete(entry)
  }

  const heartbeat = window.setInterval(() => {
    if (Date.now() - lastSeen > HEARTBEAT_TIMEOUT_MS) {
      release()
      return
    }
    connection.client.send('2')
  }, PING_INTERVAL_MS)

  connection.client.addEventListener('message', (event) => {
    lastSeen = Date.now()
    const token = readAuthToken(event.data)
    if (token === null) return
    const session = findSession(token)
    entry.userId = session && isSessionActive(session) ? session.userId : null
  })

  connection.client.addEventListener('close', release)
})

function envelope() {
  const sequence = nextEventSequence()
  persist()
  return {
    eventId: `evt_${String(sequence).padStart(8, '0')}`,
    occurredAt: new Date().toISOString(),
  }
}

export function createNftUpdatedEvent(nft: NftRecord): NftUpdatedEvent {
  const summary = summarizeNft(nft)
  return {
    ...envelope(),
    type: 'nft.updated',
    version: nft.version,
    resource: { type: 'nft', id: nft.id },
    data: {
      price: summary.price,
      available: summary.available,
      editions: nft.editions.map(({ id, price, available }) => ({ id, price, available })),
    },
  }
}

export function createOrderUpdatedEvent(order: OrderRecord): OrderUpdatedEvent {
  return {
    ...envelope(),
    type: 'order.updated',
    version: order.version,
    resource: { type: 'order', id: order.id },
    data: {
      status: order.status,
      transactionHash: order.transactionHash,
      declineReason: order.declineReason,
    },
  }
}

export function sendNftUpdated(event: NftUpdatedEvent) {
  for (const connection of connections) connection.emit(REALTIME_EVENTS.nftUpdated, event)
}

export function sendOrderUpdated(userId: string, event: OrderUpdatedEvent) {
  for (const connection of connections) {
    if (connection.userId === userId) connection.emit(REALTIME_EVENTS.orderUpdated, event)
  }
}

export function broadcastNftUpdated(nft: NftRecord) {
  const event = createNftUpdatedEvent(nft)
  sendNftUpdated(event)
  return event
}

export function notifyOrderUpdated(order: OrderRecord) {
  const event = createOrderUpdatedEvent(order)
  sendOrderUpdated(order.userId, event)
  return event
}

export function dropConnections() {
  for (const connection of [...connections]) connection.close()
}

export function connectionCount() {
  return connections.size
}
