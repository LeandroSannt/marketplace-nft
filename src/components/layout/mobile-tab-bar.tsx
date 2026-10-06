import { Link, useRouterState } from '@tanstack/react-router'
import { HomeIcon, ShoppingCartIcon, StoreIcon, UserIcon, type LucideIcon } from 'lucide-react'
import { useCurrentUser } from '@/features/auth/hooks'
import { useCart } from '@/features/cart/hooks'
import { cn } from '@/lib/utils'

interface TabItemProps {
  to: '/' | '/cart' | '/login' | '/account/profile'
  hash?: string
  label: string
  icon: LucideIcon
  active: boolean
  badge?: number
}

function TabItem({ to, hash, label, icon: Icon, active, badge }: TabItemProps) {
  return (
    <Link
      to={to}
      hash={hash}
      activeOptions={{ exact: true, includeHash: true }}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 text-caption-sm',
        active ? 'font-bold text-text-accent' : 'text-text-secondary',
      )}
    >
      <Icon className="size-6" aria-hidden />
      {label}
      {badge ? (
        <span className="absolute top-0 left-1/2 ml-2 grid size-4 place-items-center rounded-full bg-primary text-tiny font-medium text-ink outline-2 outline-ink">
          {badge > 9 ? '9+' : badge}
          <span className="sr-only"> itens no carrinho</span>
        </span>
      ) : null}
    </Link>
  )
}

export function MobileTabBar() {
  const { pathname, hash } = useRouterState({ select: (state) => state.location })
  const { isAuthenticated } = useCurrentUser()
  const { itemCount } = useCart()
  const isCatalogAnchor = pathname === '/' && hash === 'catalogo'
  const isMarket = isCatalogAnchor || pathname.startsWith('/nfts')

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch px-2">
        <TabItem
          to="/"
          label="Início"
          icon={HomeIcon}
          active={pathname === '/' && !isCatalogAnchor}
        />
        <TabItem to="/" hash="catalogo" label="Mercado" icon={StoreIcon} active={isMarket} />
        <TabItem
          to="/cart"
          label="Carrinho"
          icon={ShoppingCartIcon}
          active={pathname.startsWith('/cart') || pathname.startsWith('/checkout')}
          badge={itemCount}
        />
        <TabItem
          to={isAuthenticated ? '/account/profile' : '/login'}
          label="Conta"
          icon={UserIcon}
          active={pathname.startsWith('/account') || pathname === '/login'}
        />
      </div>
    </nav>
  )
}
