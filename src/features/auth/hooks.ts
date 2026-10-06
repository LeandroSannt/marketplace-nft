import { useQuery } from '@tanstack/react-query'
import { sessionQuery } from '@/features/auth/queries'
import { useSession } from '@/lib/session-store'

export function useCurrentUser() {
  const { token, userId } = useSession()
  const query = useQuery({ ...sessionQuery(token ?? ''), enabled: Boolean(token) })
  return {
    userId,
    user: query.data?.user ?? null,
    isAuthenticated: Boolean(token && userId),
  }
}
