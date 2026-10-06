import type { Network } from '@/contracts/common'
import { orderSchema, ordersListSchema, type CreateOrderRequest } from '@/contracts/order'
import { quoteSchema, type QuoteStage } from '@/contracts/quote'
import { apiRequest } from '@/lib/http'

export const ORDER_REQUEST_TIMEOUT_MS = 8_000

export const checkoutApi = {
  quote: (network: Network, stage: QuoteStage, signal?: AbortSignal) =>
    apiRequest(quoteSchema, { method: 'POST', url: '/quotes', data: { network, stage }, signal }),
  createOrder: (body: CreateOrderRequest, idempotencyKey: string) =>
    apiRequest(orderSchema, {
      method: 'POST',
      url: '/orders',
      data: body,
      headers: { 'Idempotency-Key': idempotencyKey },
      timeout: ORDER_REQUEST_TIMEOUT_MS,
    }),
  order: (id: string, signal?: AbortSignal) =>
    apiRequest(orderSchema, { method: 'GET', url: `/orders/${encodeURIComponent(id)}`, signal }),
  pendingOrders: (signal?: AbortSignal) =>
    apiRequest(ordersListSchema, {
      method: 'GET',
      url: '/orders',
      params: { status: 'pending' },
      signal,
    }),
}
