import { useQuery } from '@tanstack/react-query'
import { cartQuery, cartScope } from '@/features/cart/queries'
import { useSession } from '@/lib/session-store'

export function useCartScope() {
  return cartScope(useSession().userId)
}

export function useCart() {
  const scope = useCartScope()
  const query = useQuery(cartQuery(scope))
  const itemCount = query.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  return { ...query, scope, itemCount }
}
