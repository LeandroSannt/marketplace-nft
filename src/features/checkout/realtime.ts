import type { QueryClient } from '@tanstack/react-query'
import type { OrderUpdatedEvent } from '@/contracts/events'
import type { Order } from '@/contracts/order'
import { cartKeys } from '@/features/cart/queries'
import { orderKeys } from '@/features/checkout/queries'

export function applyOrderUpdated(
  queryClient: QueryClient,
  userId: string,
  event: OrderUpdatedEvent,
) {
  const key = orderKeys.detail(userId, event.resource.id)
  const cached = queryClient.getQueryData<Order>(key)

  if (cached && cached.version < event.version) {
    queryClient.setQueryData<Order>(key, {
      ...cached,
      status: event.data.status,
      transactionHash: event.data.transactionHash,
      declineReason: event.data.declineReason,
      version: event.version,
      updatedAt: event.occurredAt,
    })
  }
  if (!cached) void queryClient.invalidateQueries({ queryKey: key })

  void queryClient.invalidateQueries({ queryKey: orderKeys.pending(userId) })
  if (event.data.status === 'confirmed') {
    void queryClient.invalidateQueries({ queryKey: key })
    void queryClient.invalidateQueries({ queryKey: cartKeys.forScope(userId) })
  }
}
