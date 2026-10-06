import { z } from 'zod'
import { ethAmountSchema, networkSchema, quantitySchema } from '@/contracts/common'
import { artworkSchema } from '@/contracts/nft'

export const cartItemSchema = z.object({
  nftId: z.string(),
  editionId: z.string(),
  name: z.string(),
  editionName: z.string(),
  artwork: artworkSchema,
  network: networkSchema,
  quantity: quantitySchema,
  unitPrice: ethAmountSchema,
  available: z.number().int().nonnegative(),
  maxPerOrder: z.number().int().positive(),
  nftVersion: z.number().int().nonnegative(),
})
export type CartItem = z.infer<typeof cartItemSchema>

export const cartSchema = z.object({
  id: z.string(),
  items: z.array(cartItemSchema),
  couponCode: z.string().nullable(),
  version: z.number().int().nonnegative(),
})
export type Cart = z.infer<typeof cartSchema>

export const addCartItemRequestSchema = z.object({
  nftId: z.string(),
  editionId: z.string(),
  quantity: quantitySchema,
})
export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>

export const updateCartItemRequestSchema = z.object({
  quantity: quantitySchema,
})
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>

export const applyCouponRequestSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código').max(32).toUpperCase(),
})
export type ApplyCouponRequest = z.infer<typeof applyCouponRequestSchema>

export const mergeCartRequestSchema = z.object({
  guestCartId: z.string(),
})
export type MergeCartRequest = z.infer<typeof mergeCartRequestSchema>
