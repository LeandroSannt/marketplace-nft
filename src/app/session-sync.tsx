import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { router } from '@/app/router'
import { clearPrivateCache } from '@/features/auth/queries'
import { sessionStore, useSession } from '@/lib/session-store'

const AUTH_PATHS = ['/login', '/register']

export function SessionSync() {
  const queryClient = useQueryClient()
  const { expired } = useSession()

  useEffect(() => {
    if (!expired) return
    clearPrivateCache(queryClient)
    sessionStore.acknowledgeExpiration()
    const { pathname, href } = router.state.location
    toast.warning('Sua sessão expirou. Entre novamente para continuar.')
    if (AUTH_PATHS.includes(pathname)) return
    void router.navigate({ to: '/login', search: { redirect: href } })
  }, [expired, queryClient])

  return null
}
