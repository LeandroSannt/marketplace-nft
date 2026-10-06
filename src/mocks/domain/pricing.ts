import type { EthAmount, Network } from '@/contracts/common'
import type { QuoteIssue, QuoteLine } from '@/contracts/quote'
import { addEth, compareEth, multiplyEth, percentOfEth, subtractEth } from '@/lib/money'
import { db, type CartRecord, type QuoteRecord } from '@/mocks/db'
import { findNft } from '@/mocks/domain/catalog'
import { COUPONS, NETWORK_FEES, type CouponRecord } from '@/mocks/fixtures/commerce'
import { MockHttpError } from '@/mocks/lib/http'
import { createId } from '@/mocks/lib/random'

const QUOTE_TTL_MS = 5 * 60_000

export function findValidCoupon(code: string): CouponRecord {
  const coupon = COUPONS.find((item) => item.code === code.toUpperCase())
  if (!coupon)
    throw new MockHttpError(422, 'COUPON_INVALID', 'Cupom inválido', { code: ['Cupom inválido'] })
  if (new Date(coupon.expiresAt).getTime() < Date.now()) {
    throw new MockHttpError(422, 'COUPON_EXPIRED', 'Este cupom expirou', {
      code: ['Este cupom expirou'],
    })
  }
  return coupon
}

function activeCoupon(code: string | null) {
  if (!code) return null
  try {
    return findValidCoupon(code)
  } catch {
    return null
  }
}

export function buildQuote(cart: CartRecord, network: Network, userId: string | null): QuoteRecord {
  const lines: QuoteLine[] = []
  const issues: QuoteIssue[] = []

  for (const line of cart.items) {
    const nft = findNft(line.nftId)
    const edition = nft?.editions.find((item) => item.id === line.editionId)
    if (!nft || !edition) continue
    if (edition.available === 0) {
      issues.push({ type: 'OUT_OF_STOCK', nftId: nft.id, editionId: edition.id })
      continue
    }
    if (line.quantity > edition.available) {
      issues.push({
        type: 'QUANTITY_REDUCED',
        nftId: nft.id,
        editionId: edition.id,
        requested: line.quantity,
        available: edition.available,
      })
    }
    const quantity = Math.min(line.quantity, edition.available)
    lines.push({
      nftId: nft.id,
      editionId: edition.id,
      name: nft.name,
      editionName: edition.name,
      artwork: nft.artwork,
      quantity,
      unitPrice: edition.price,
      lineTotal: multiplyEth(edition.price, quantity),
    })
  }

  const coupon = activeCoupon(cart.couponCode)
  const subtotal: EthAmount = lines.length ? addEth(...lines.map((line) => line.lineTotal)) : '0'
  const discount = coupon ? percentOfEth(subtotal, coupon.percentOff) : '0'
  const networkFee = lines.length ? NETWORK_FEES[network] : '0'

  return {
    id: createId('quo'),
    userId,
    cartId: cart.id,
    network,
    lines,
    coupon: coupon ? { code: coupon.code, percentOff: coupon.percentOff } : null,
    subtotal,
    discount,
    networkFee,
    total: addEth(subtractEth(subtotal, discount), networkFee),
    issues,
    cartVersion: cart.version,
    expiresAt: new Date(Date.now() + QUOTE_TTL_MS).toISOString(),
  }
}

export function saveQuote(quote: QuoteRecord) {
  db().quotes[quote.id] = quote
  return quote
}

export function toQuoteResponse(quote: QuoteRecord) {
  const { userId: _userId, cartId: _cartId, ...response } = quote
  return response
}

export function priceChanges(previous: QuoteRecord, current: QuoteRecord): QuoteIssue[] {
  return current.lines.flatMap((line): QuoteIssue[] => {
    const before = previous.lines.find(
      (item) => item.nftId === line.nftId && item.editionId === line.editionId,
    )
    if (!before || compareEth(before.unitPrice, line.unitPrice) === 0) return []
    return [
      {
        type: 'PRICE_CHANGED',
        nftId: line.nftId,
        editionId: line.editionId,
        previousPrice: before.unitPrice,
        currentPrice: line.unitPrice,
      },
    ]
  })
}

export function isSameQuote(previous: QuoteRecord, current: QuoteRecord) {
  return (
    current.issues.length === 0 &&
    previous.cartVersion === current.cartVersion &&
    previous.total === current.total &&
    previous.discount === current.discount &&
    previous.networkFee === current.networkFee &&
    previous.lines.length === current.lines.length &&
    priceChanges(previous, current).length === 0
  )
}
