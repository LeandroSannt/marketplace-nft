import { userSchema } from '@/contracts/auth'
import type { Network } from '@/contracts/common'
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/contracts/profile'
import {
  walletConnectionSchema,
  walletSchema,
  walletsResponseSchema,
  type UpsertWalletRequest,
} from '@/contracts/wallet'
import { apiRequest, apiVoid } from '@/lib/http'

export const accountApi = {
  profile: (signal?: AbortSignal) =>
    apiRequest(userSchema, { method: 'GET', url: '/profile', signal }),
  updateProfile: (body: UpdateProfileRequest) =>
    apiRequest(userSchema, { method: 'PATCH', url: '/profile', data: body }),
  changePassword: (body: ChangePasswordRequest) =>
    apiVoid({ method: 'POST', url: '/profile/password', data: body }),
  wallets: (signal?: AbortSignal) =>
    apiRequest(walletsResponseSchema, { method: 'GET', url: '/wallets', signal }),
  createWallet: (body: UpsertWalletRequest) =>
    apiRequest(walletSchema, { method: 'POST', url: '/wallets', data: body }),
  updateWallet: (id: string, body: UpsertWalletRequest) =>
    apiRequest(walletSchema, {
      method: 'PATCH',
      url: `/wallets/${encodeURIComponent(id)}`,
      data: body,
    }),
  connectWallet: (id: string, network: Network) =>
    apiRequest(walletConnectionSchema, {
      method: 'POST',
      url: `/wallets/${encodeURIComponent(id)}/connect`,
      data: { network },
    }),
  disconnectWallet: (id: string) =>
    apiRequest(walletConnectionSchema, {
      method: 'POST',
      url: `/wallets/${encodeURIComponent(id)}/disconnect`,
    }),
}
