import { z } from 'zod'

export const ethAmountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,18})?$/, 'Valor em ETH deve ser uma string decimal')

export type EthAmount = z.infer<typeof ethAmountSchema>

export const isoDateSchema = z.iso.datetime()

export const quantitySchema = z.number().int().positive()

export const networkSchema = z.enum(['ethereum', 'polygon', 'solana'])
export type Network = z.infer<typeof networkSchema>

export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'SESSION_EXPIRED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'OUT_OF_STOCK',
  'QUANTITY_LIMIT',
  'COUPON_INVALID',
  'COUPON_EXPIRED',
  'QUOTE_OUTDATED',
  'IDEMPOTENCY_CONFLICT',
  'WALLET_REJECTED',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_ERROR',
])
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
    details: z.unknown().optional(),
  }),
})
export type ApiErrorBody = z.infer<typeof apiErrorSchema>

export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  })
}
