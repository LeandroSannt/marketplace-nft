import { http, HttpResponse } from 'msw'
import {
  addCartItemRequestSchema,
  applyCouponRequestSchema,
  mergeCartRequestSchema,
  updateCartItemRequestSchema,
} from '@/contracts/cart'
import { persist } from '@/mocks/db'
import {
  addLine,
  mergeGuestCart,
  removeLine,
  resolveCart,
  setCoupon,
  setLineQuantity,
  toCartResponse,
  userCart,
} from '@/mocks/domain/cart'
import { findValidCoupon } from '@/mocks/domain/pricing'
import { API, optionalUser, parseBody, requireUser, route } from '@/mocks/lib/http'

type LineParams = { nftId: string; editionId: string }

function cartFor(request: Request) {
  const cart = resolveCart(request, optionalUser(request))
  persist()
  return cart
}

export const cartHandlers = [
  http.get(
    `${API}/cart`,
    route(({ request }) => HttpResponse.json(toCartResponse(cartFor(request)))),
  ),

  http.post(
    `${API}/cart/items`,
    route(async ({ request }) => {
      const body = await parseBody(request, addCartItemRequestSchema)
      return HttpResponse.json(toCartResponse(addLine(cartFor(request), body)))
    }),
  ),

  http.patch<LineParams>(
    `${API}/cart/items/:nftId/:editionId`,
    route<LineParams>(async ({ request, params }) => {
      const body = await parseBody(request, updateCartItemRequestSchema)
      const cart = setLineQuantity(cartFor(request), params.nftId, params.editionId, body.quantity)
      return HttpResponse.json(toCartResponse(cart))
    }),
  ),

  http.delete<LineParams>(
    `${API}/cart/items/:nftId/:editionId`,
    route<LineParams>(({ request, params }) => {
      const cart = removeLine(cartFor(request), params.nftId, params.editionId)
      return HttpResponse.json(toCartResponse(cart))
    }),
  ),

  http.put(
    `${API}/cart/coupon`,
    route(async ({ request }) => {
      const body = await parseBody(request, applyCouponRequestSchema)
      const coupon = findValidCoupon(body.code)
      return HttpResponse.json(toCartResponse(setCoupon(cartFor(request), coupon.code)))
    }),
  ),

  http.delete(
    `${API}/cart/coupon`,
    route(({ request }) => HttpResponse.json(toCartResponse(setCoupon(cartFor(request), null)))),
  ),

  http.post(
    `${API}/cart/merge`,
    route(async ({ request }) => {
      const user = requireUser(request)
      const body = await parseBody(request, mergeCartRequestSchema)
      return HttpResponse.json(toCartResponse(mergeGuestCart(userCart(user.id), body.guestCartId)))
    }),
  ),
]
