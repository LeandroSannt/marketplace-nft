import { z } from 'zod'
import { networkSchema } from '@/contracts/common'

export const walletSlotSchema = z.enum(['primary', 'secondary'])
export type WalletSlot = z.infer<typeof walletSlotSchema>

export const walletProviderSchema = z.enum(['metamask', 'walletconnect', 'coinbase', 'phantom'])
export type WalletProvider = z.infer<typeof walletProviderSchema>

export const walletAddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Informe um endereço 0x com 40 caracteres hexadecimais')

export const walletSchema = z.object({
  id: z.string(),
  slot: walletSlotSchema,
  provider: walletProviderSchema,
  label: z.string(),
  address: z.string(),
  network: networkSchema,
  ens: z.string(),
})
export type Wallet = z.infer<typeof walletSchema>

export const walletsResponseSchema = z.object({
  items: z.array(walletSchema),
})

export const upsertWalletRequestSchema = z.object({
  slot: walletSlotSchema,
  provider: walletProviderSchema,
  label: z.string().trim().min(2, 'Use pelo menos 2 caracteres').max(32),
  address: walletAddressSchema,
  network: networkSchema,
  ens: z.union([
    z.literal(''),
    z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i, 'Informe um nome ENS válido (.eth)'),
  ]),
})
export type UpsertWalletRequest = z.infer<typeof upsertWalletRequestSchema>

export const walletConnectionSchema = z.object({
  walletId: z.string(),
  network: networkSchema,
  status: z.enum(['connected', 'disconnected']),
})
export type WalletConnection = z.infer<typeof walletConnectionSchema>

export const connectWalletRequestSchema = z.object({
  network: networkSchema,
})
