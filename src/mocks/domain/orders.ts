import type { CreateOrderRequest, Order } from '@/contracts/order'
import { multiplyEth } from '@/lib/money'
import {
  consumeTrigger,
  db,
  persist,
  type OrderRecord,
  type QuoteRecord,
  type UserRecord,
} from '@/mocks/db'
import { findNft } from '@/mocks/domain/catalog'
import { removePurchased } from '@/mocks/domain/cart'
import { hexFrom, createId } from '@/mocks/lib/random'
import { broadcastNftUpdated, notifyOrderUpdated } from '@/mocks/realtime'
import { getScenario } from '@/mocks/scenarios'

const SETTLEMENT_DELAY_MS = 3000
const PRICE_SHOCK_DELAY_MS = 1500
const timers = new Map<string, number>()

function explorerPath(order: OrderRecord) {
  if (!order.transactionHash) return null
  return `/explorer/tx/${order.transactionHash}?order=${encodeURIComponent(order.id)}`
}

export function toOrderResponse(order: OrderRecord): Order {
  const {
    userId: _userId,
    cartId: _cartId,
    idempotencyKey: _key,
    requestHash: _hash,
    settleAt: _settleAt,
    outcome: _outcome,
    ...response
  } = order
  return { ...response, explorerUrl: explorerPath(order) }
}

function adjustStock(order: OrderRecord, direction: -1 | 1) {
  const touched = new Set<string>()
  for (const line of order.lines) {
    const nft = findNft(line.nftId)
    const edition = nft?.editions.find((item) => item.id === line.editionId)
    if (!nft || !edition) continue
    edition.available = Math.max(0, edition.available + direction * line.quantity)
    nft.version += 1
    touched.add(nft.id)
  }
  persist()
  for (const id of touched) {
    const nft = findNft(id)
    if (nft) broadcastNftUpdated(nft)
  }
}

export function settleOrder(orderId: string) {
  const order = db().orders[orderId]
  if (!order || order.status !== 'pending') return
  window.clearTimeout(timers.get(orderId))
  timers.delete(orderId)

  const now = new Date().toISOString()
  order.status = order.outcome
  order.updatedAt = now
  order.version += 1

  if (order.outcome === 'confirmed') {
    const hash = `0x${hexFrom(order.id, 64)}`
    order.transactionHash = hash
    const cart = db().carts[order.cartId]
    if (cart) removePurchased(cart, order.lines)
  } else {
    order.declineReason = 'A carteira recusou a assinatura da transação'
    adjustStock(order, 1)
  }

  persist()
  notifyOrderUpdated(order)
}

function scheduleSettlement(order: OrderRecord) {
  const wait = Math.max(0, new Date(order.settleAt).getTime() - Date.now())
  timers.set(
    order.id,
    window.setTimeout(() => {
      settleOrder(order.id)
    }, wait),
  )
}

export function resumePendingOrders() {
  for (const order of Object.values(db().orders)) {
    if (order.status === 'pending') scheduleSettlement(order)
  }
}

export function createOrder(params: {
  user: UserRecord
  quote: QuoteRecord
  request: CreateOrderRequest
  idempotencyKey: string
  requestHash: string
}): OrderRecord {
  const { user, quote, request, idempotencyKey, requestHash } = params
  const wallet = db().wallets[user.id]?.find((item) => item.id === request.walletId)
  const now = new Date()

  const order: OrderRecord = {
    id: createId('ord'),
    status: 'pending',
    network: request.network,
    wallet: {
      id: wallet?.id ?? request.walletId,
      label: wallet?.label ?? '',
      address: wallet?.address ?? '',
    },
    buyer: request.buyer,
    lines: quote.lines.map((line) => ({
      ...line,
      lineTotal: multiplyEth(line.unitPrice, line.quantity),
    })),
    coupon: quote.coupon,
    subtotal: quote.subtotal,
    discount: quote.discount,
    networkFee: quote.networkFee,
    total: quote.total,
    transactionHash: null,
    explorerUrl: null,
    declineReason: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    version: 1,
    userId: user.id,
    cartId: quote.cartId,
    idempotencyKey,
    requestHash,
    settleAt: new Date(now.getTime() + SETTLEMENT_DELAY_MS).toISOString(),
    outcome: getScenario() === 'payment-declined' ? 'declined' : 'confirmed',
  }

  db().orders[order.id] = order
  persist()
  adjustStock(order, -1)
  scheduleSettlement(order)
  return order
}

export function findOrderByKey(userId: string, idempotencyKey: string) {
  return Object.values(db().orders).find(
    (order) => order.userId === userId && order.idempotencyKey === idempotencyKey,
  )
}

export function scheduleCheckoutShock(quote: QuoteRecord) {
  const scenario = getScenario()
  if (scenario !== 'price-change-on-checkout' && scenario !== 'sold-out-on-checkout') return
  const target = quote.lines[0]
  if (!target || !consumeTrigger(scenario)) return

  const shock = window.setTimeout(() => {
    const nft = findNft(target.nftId)
    const edition = nft?.editions.find((item) => item.id === target.editionId)
    if (!nft || !edition) return
    if (scenario === 'price-change-on-checkout') edition.price = multiplyEth(edition.price, 1.15)
    else edition.available = 0
    nft.version += 1
    persist()
    broadcastNftUpdated(nft)
  }, PRICE_SHOCK_DELAY_MS)
  timers.set(`shock:${quote.id}`, shock)
}

export function clearOrderTimers() {
  for (const timer of timers.values()) window.clearTimeout(timer)
  timers.clear()
}
