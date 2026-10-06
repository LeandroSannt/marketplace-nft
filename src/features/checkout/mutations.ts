import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateOrderRequest, Order } from '@/contracts/order'
import { checkoutApi } from '@/features/checkout/api'
import { clearOrderAttempt, idempotencyKeyFor } from '@/features/checkout/order-attempt'
import { orderKeys } from '@/features/checkout/queries'

export function useCreateOrder(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...orderKeys.forUser(userId), 'create'],
    mutationFn: (request: CreateOrderRequest) =>
      checkoutApi.createOrder(request, idempotencyKeyFor(userId, request)),
    onSuccess: (order: Order) => {
      clearOrderAttempt(userId)
      queryClient.setQueryData(orderKeys.detail(userId, order.id), order)
      void queryClient.invalidateQueries({ queryKey: orderKeys.pending(userId) })
    },
  })
}
