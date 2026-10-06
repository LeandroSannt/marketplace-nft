import type { Quote } from '@/contracts/quote'

export function quoteFingerprint(quote: Quote) {
  return JSON.stringify({
    network: quote.network,
    lines: quote.lines.map((line) => [line.nftId, line.editionId, line.quantity, line.unitPrice]),
    coupon: quote.coupon?.code ?? null,
    subtotal: quote.subtotal,
    discount: quote.discount,
    networkFee: quote.networkFee,
    total: quote.total,
    issues: quote.issues.length,
  })
}
