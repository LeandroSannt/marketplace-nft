import { z } from 'zod'
import { emailSchema } from '@/contracts/auth'
import { ethAmountSchema, isoDateSchema, networkSchema } from '@/contracts/common'
import { quoteLineSchema } from '@/contracts/quote'

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'declined'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

export const buyerSchema = z.object({
  fullName: z.string().trim().min(3, 'Informe seu nome completo').max(80),
  email: emailSchema,
})
export type Buyer = z.infer<typeof buyerSchema>

export const orderSchema = z.object({
  id: z.string(),
  status: orderStatusSchema,
  network: networkSchema,
  wallet: z.object({ id: z.string(), label: z.string(), address: z.string() }),
  buyer: buyerSchema,
  lines: z.array(quoteLineSchema),
  coupon: z.object({ code: z.string(), percentOff: z.number() }).nullable(),
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  transactionHash: z.string().nullable(),
  explorerUrl: z.string().nullable(),
  declineReason: z.string().nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  version: z.number().int().nonnegative(),
})
export type Order = z.infer<typeof orderSchema>

export const createOrderRequestSchema = z.object({
  quoteId: z.string(),
  walletId: z.string(),
  network: networkSchema,
  buyer: buyerSchema,
})
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>

export const ordersListSchema = z.object({
  items: z.array(orderSchema),
})
export type OrdersList = z.infer<typeof ordersListSchema>
