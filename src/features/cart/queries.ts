import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AddCartItemRequest, Cart } from '@/contracts/cart'
import { cartApi } from '@/features/cart/api'
import { quoteKeys } from '@/features/checkout/queries'

export type CartScope = string

export const cartKeys = {
  all: ['cart'] as const,
  forScope: (scope: CartScope) => [...cartKeys.all, scope] as const,
}

export function cartScope(userId: string | null): CartScope {
  return userId ?? 'guest'
}

export const cartQuery = (scope: CartScope) =>
  queryOptions({
    queryKey: cartKeys.forScope(scope),
    queryFn: ({ signal }) => cartApi.get(signal),
  })

function useCartMutation<TInput>(scope: CartScope, mutationFn: (input: TInput) => Promise<Cart>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...cartKeys.forScope(scope), 'mutate'],
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.forScope(scope), cart)
      void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.forScope(scope) })
      void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },
  })
}

export function useAddToCart(scope: CartScope) {
  return useCartMutation(scope, (input: AddCartItemRequest) => cartApi.addItem(input))
}

export function useUpdateCartItem(scope: CartScope) {
  return useCartMutation(
    scope,
    ({ nftId, editionId, quantity }: { nftId: string; editionId: string; quantity: number }) =>
      cartApi.updateItem(nftId, editionId, quantity),
  )
}

export function useRemoveCartItem(scope: CartScope) {
  return useCartMutation(scope, ({ nftId, editionId }: { nftId: string; editionId: string }) =>
    cartApi.removeItem(nftId, editionId),
  )
}

export function useApplyCoupon(scope: CartScope) {
  return useCartMutation(scope, (code: string) => cartApi.applyCoupon(code))
}

export function useRemoveCoupon(scope: CartScope) {
  return useCartMutation(scope, () => cartApi.removeCoupon())
}
