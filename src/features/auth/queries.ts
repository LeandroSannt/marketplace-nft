import { queryOptions, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { LoginRequest, RegisterRequest, Session } from '@/contracts/auth'
import { authApi } from '@/features/auth/api'
import { cartApi } from '@/features/cart/api'
import { cartKeys } from '@/features/cart/queries'
import { toast } from 'sonner'
import { guestCartStore, sessionStore } from '@/lib/session-store'

export const sessionKeys = {
  all: ['session'] as const,
  forToken: (token: string) => [...sessionKeys.all, token] as const,
}

const PRIVATE_QUERY_ROOTS = [
  'session',
  'favorites',
  'cart',
  'quote',
  'orders',
  'profile',
  'wallets',
]

export function clearPrivateCache(queryClient: QueryClient) {
  for (const root of PRIVATE_QUERY_ROOTS) {
    void queryClient.cancelQueries({ queryKey: [root] })
    queryClient.removeQueries({ queryKey: [root] })
  }
}

export const sessionQuery = (token: string) =>
  queryOptions({
    queryKey: sessionKeys.forToken(token),
    queryFn: ({ signal }) => authApi.session(signal),
    staleTime: 5 * 60_000,
    retry: false,
  })

async function startSession(queryClient: QueryClient, session: Session) {
  const guestCartId = guestCartStore.get()
  clearPrivateCache(queryClient)
  sessionStore.start(session.token, session.user.id)
  queryClient.setQueryData(sessionKeys.forToken(session.token), {
    expiresAt: session.expiresAt,
    user: session.user,
  })
  if (!guestCartId) return
  try {
    const cart = await cartApi.merge(guestCartId)
    guestCartStore.clear()
    queryClient.setQueryData(cartKeys.forScope(session.user.id), cart)
  } catch {
    toast.error(
      'Não foi possível juntar os itens do visitante ao seu carrinho. Eles serão mantidos para uma nova tentativa no próximo login.',
    )
  }
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (session) => startSession(queryClient, session),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: (session) => startSession(queryClient, session),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout().catch(() => undefined),
    onSettled: () => {
      sessionStore.clear()
      guestCartStore.clear()
      clearPrivateCache(queryClient)
    },
  })
}
