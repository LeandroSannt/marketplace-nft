import { useQuery } from '@tanstack/react-query'
import { favoritesQuery } from '@/features/favorites/queries'
import { useSession } from '@/lib/session-store'

const NO_FAVORITES: readonly string[] = []

export function useFavoriteIds() {
  const { userId } = useSession()
  const query = useQuery({ ...favoritesQuery(userId ?? ''), enabled: Boolean(userId) })
  return userId ? (query.data?.nftIds ?? NO_FAVORITES) : NO_FAVORITES
}
