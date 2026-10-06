import { z } from 'zod'
import { ethAmountSchema, isoDateSchema, networkSchema, quantitySchema } from '@/contracts/common'
import { artworkSchema } from '@/contracts/nft'

export const quoteLineSchema = z.object({
  nftId: z.string(),
  editionId: z.string(),
  name: z.string(),
  editionName: z.string(),
  artwork: artworkSchema,
  quantity: quantitySchema,
  unitPrice: ethAmountSchema,
  lineTotal: ethAmountSchema,
})
export type QuoteLine = z.infer<typeof quoteLineSchema>

export const quoteIssueSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('PRICE_CHANGED'),
    nftId: z.string(),
    editionId: z.string(),
    previousPrice: ethAmountSchema,
    currentPrice: ethAmountSchema,
  }),
  z.object({
    type: z.literal('QUANTITY_REDUCED'),
    nftId: z.string(),
    editionId: z.string(),
    requested: z.number().int(),
    available: z.number().int(),
  }),
  z.object({
    type: z.literal('OUT_OF_STOCK'),
    nftId: z.string(),
    editionId: z.string(),
  }),
])
export type QuoteIssue = z.infer<typeof quoteIssueSchema>

export const quoteSchema = z.object({
  id: z.string(),
  network: networkSchema,
  lines: z.array(quoteLineSchema),
  coupon: z.object({ code: z.string(), percentOff: z.number() }).nullable(),
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  issues: z.array(quoteIssueSchema),
  cartVersion: z.number().int().nonnegative(),
  expiresAt: isoDateSchema,
})
export type Quote = z.infer<typeof quoteSchema>

export const quoteStageSchema = z.enum(['cart', 'checkout'])
export type QuoteStage = z.infer<typeof quoteStageSchema>

export const quoteRequestSchema = z.object({
  network: networkSchema,
  stage: quoteStageSchema.default('cart'),
})
export type QuoteRequest = z.infer<typeof quoteRequestSchema>
