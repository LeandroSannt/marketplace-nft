import { queryOptions } from '@tanstack/react-query'
import type { Network } from '@/contracts/common'
import type { Order } from '@/contracts/order'
import type { QuoteStage } from '@/contracts/quote'
import { checkoutApi } from '@/features/checkout/api'

export const quoteKeys = {
  all: ['quote'] as const,
  forScope: (scope: string, network: Network, stage: QuoteStage) =>
    [...quoteKeys.all, scope, network, stage] as const,
}

export const orderKeys = {
  all: ['orders'] as const,
  forUser: (userId: string) => [...orderKeys.all, userId] as const,
  detail: (userId: string, orderId: string) =>
    [...orderKeys.forUser(userId), 'detail', orderId] as const,
  pending: (userId: string) => [...orderKeys.forUser(userId), 'pending'] as const,
}

export const quoteQuery = (scope: string, network: Network, stage: QuoteStage) =>
  queryOptions({
    queryKey: quoteKeys.forScope(scope, network, stage),
    queryFn: ({ signal }) => checkoutApi.quote(network, stage, signal),
    staleTime: 0,
  })

const isTerminal = (order: Order | undefined) =>
  order?.status === 'confirmed' || order?.status === 'declined'

export const orderQuery = (userId: string, orderId: string) =>
  queryOptions({
    queryKey: orderKeys.detail(userId, orderId),
    queryFn: ({ signal }) => checkoutApi.order(orderId, signal),
    staleTime: (query) => (isTerminal(query.state.data) ? Infinity : 0),
    refetchInterval: (query) => (isTerminal(query.state.data) ? false : 10_000),
  })

export const pendingOrdersQuery = (userId: string) =>
  queryOptions({
    queryKey: orderKeys.pending(userId),
    queryFn: ({ signal }) => checkoutApi.pendingOrders(signal),
  })
