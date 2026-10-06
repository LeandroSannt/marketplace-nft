import { cartSchema, type AddCartItemRequest } from '@/contracts/cart'
import { apiRequest } from '@/lib/http'
import { guestCartStore, sessionStore } from '@/lib/session-store'

function linePath(nftId: string, editionId: string) {
  return `/cart/items/${encodeURIComponent(nftId)}/${encodeURIComponent(editionId)}`
}

async function rememberGuestCart<T extends { id: string }>(promise: Promise<T>) {
  const cart = await promise
  if (!sessionStore.get().token) guestCartStore.set(cart.id)
  return cart
}

export const cartApi = {
  get: (signal?: AbortSignal) =>
    rememberGuestCart(apiRequest(cartSchema, { method: 'GET', url: '/cart', signal })),
  addItem: (body: AddCartItemRequest) =>
    rememberGuestCart(apiRequest(cartSchema, { method: 'POST', url: '/cart/items', data: body })),
  updateItem: (nftId: string, editionId: string, quantity: number) =>
    apiRequest(cartSchema, {
      method: 'PATCH',
      url: linePath(nftId, editionId),
      data: { quantity },
    }),
  removeItem: (nftId: string, editionId: string) =>
    apiRequest(cartSchema, { method: 'DELETE', url: linePath(nftId, editionId) }),
  applyCoupon: (code: string) =>
    apiRequest(cartSchema, { method: 'PUT', url: '/cart/coupon', data: { code } }),
  removeCoupon: () => apiRequest(cartSchema, { method: 'DELETE', url: '/cart/coupon' }),
  merge: (guestCartId: string) =>
    apiRequest(cartSchema, { method: 'POST', url: '/cart/merge', data: { guestCartId } }),
}
