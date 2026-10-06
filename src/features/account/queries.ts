import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/contracts/auth'
import type { Network } from '@/contracts/common'
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/contracts/profile'
import type { UpsertWalletRequest } from '@/contracts/wallet'
import { accountApi } from '@/features/account/api'
import { sessionKeys } from '@/features/auth/queries'

export const accountKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  wallets: (userId: string) => ['wallets', userId] as const,
}

export const profileQuery = (userId: string) =>
  queryOptions({
    queryKey: accountKeys.profile(userId),
    queryFn: ({ signal }) => accountApi.profile(signal),
  })

export const walletsQuery = (userId: string) =>
  queryOptions({
    queryKey: accountKeys.wallets(userId),
    queryFn: ({ signal }) => accountApi.wallets(signal),
  })

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => accountApi.updateProfile(body),
    onSuccess: (user: User) => {
      queryClient.setQueryData(accountKeys.profile(userId), user)
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => accountApi.changePassword(body),
  })
}

export function useSaveWallet(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: UpsertWalletRequest }) =>
      id ? accountApi.updateWallet(id, body) : accountApi.createWallet(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.wallets(userId) }),
  })
}

export function useConnectWallet() {
  return useMutation({
    mutationFn: ({ walletId, network }: { walletId: string; network: Network }) =>
      accountApi.connectWallet(walletId, network),
  })
}

export function useDisconnectWallet() {
  return useMutation({
    mutationFn: (walletId: string) => accountApi.disconnectWallet(walletId),
  })
}
