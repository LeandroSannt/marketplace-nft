import { z } from 'zod'
import { ethAmountSchema, isoDateSchema } from '@/contracts/common'
import { orderStatusSchema } from '@/contracts/order'

const eventEnvelope = {
  eventId: z.string(),
  version: z.number().int().nonnegative(),
  occurredAt: isoDateSchema,
}

export const nftUpdatedEventSchema = z.object({
  ...eventEnvelope,
  type: z.literal('nft.updated'),
  resource: z.object({ type: z.literal('nft'), id: z.string() }),
  data: z.object({
    price: ethAmountSchema,
    available: z.number().int().nonnegative(),
    editions: z.array(
      z.object({
        id: z.string(),
        price: ethAmountSchema,
        available: z.number().int().nonnegative(),
      }),
    ),
  }),
})
export type NftUpdatedEvent = z.infer<typeof nftUpdatedEventSchema>

export const orderUpdatedEventSchema = z.object({
  ...eventEnvelope,
  type: z.literal('order.updated'),
  resource: z.object({ type: z.literal('order'), id: z.string() }),
  data: z.object({
    status: orderStatusSchema,
    transactionHash: z.string().nullable(),
    declineReason: z.string().nullable(),
  }),
})
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>

export const REALTIME_EVENTS = {
  nftUpdated: 'nft.updated',
  orderUpdated: 'order.updated',
} as const
