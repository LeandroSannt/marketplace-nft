import { Link, useRouterState } from '@tanstack/react-router'
import {
  HeartIcon,
  HomeIcon,
  ScanLineIcon,
  ShoppingCartIcon,
  UserIcon,
  type LucideIcon,
} from 'lucide-react'
import { useCurrentUser } from '@/features/auth/hooks'
import { useCart } from '@/features/cart/hooks'
import { announceComingSoon } from '@/lib/coming-soon'
import { cn } from '@/lib/utils'

const itemClass = 'relative grid min-h-11 min-w-11 place-items-center focus-visible:rounded-md'

function itemTone(active: boolean) {
  return active ? 'text-primary' : 'text-text-secondary hover:text-text-accent'
}

interface TabItemProps {
  to: '/' | '/cart' | '/login' | '/account/profile'
  label: string
  icon: LucideIcon
  active: boolean
  filled?: boolean
  badge?: number
}

function TabItem({ to, label, icon: Icon, active, filled = true, badge }: TabItemProps) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true, includeHash: true }}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      className={cn(itemClass, itemTone(active))}
    >
      <Icon className={cn('size-6', filled && 'fill-current')} aria-hidden />
      {badge ? (
        <span className="absolute top-0.5 left-1/2 ml-1.5 grid size-4 place-items-center rounded-full bg-primary text-tiny font-medium text-ink outline-2 outline-surface-card">
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
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden',
        pathname.startsWith('/nfts/') && 'max-md:hidden',
      )}
    >
      <div className="relative mx-auto grid h-23.5 max-w-md grid-cols-5 items-center rounded-t-[30px] bg-surface-card px-4 shadow-sheet">
        <div className="grid place-items-center">
          <TabItem
            to="/"
            label="Início"
            icon={HomeIcon}
            active={pathname === '/' && !isCatalogAnchor}
          />
        </div>
        <div className="grid place-items-center">
          <button
            type="button"
            aria-label="Lista de interesse"
            onClick={() => {
              announceComingSoon('Lista de interesse')
            }}
            className={cn(itemClass, itemTone(false), 'cursor-pointer')}
          >
            <HeartIcon className="size-6 fill-current" aria-hidden />
          </button>
        </div>
        <div className="grid place-items-center">
          <Link
            to="/"
            hash="catalogo"
            activeOptions={{ exact: true, includeHash: true }}
            aria-current={isMarket ? 'page' : undefined}
            aria-label="Mercado"
            className={cn(
              'absolute -top-8 left-1/2 grid size-16.5 -translate-x-1/2 place-items-center rounded-full bg-gradient-cta text-ink ring-8 ring-background',
              isMarket && 'outline-2 outline-offset-2 outline-primary',
            )}
          >
            <ScanLineIcon className="size-7" aria-hidden />
          </Link>
        </div>
        <div className="grid place-items-center">
          <TabItem
            to="/cart"
            label="Carrinho"
            icon={ShoppingCartIcon}
            filled={false}
            active={pathname.startsWith('/cart') || pathname.startsWith('/checkout')}
            badge={itemCount}
          />
        </div>
        <div className="grid place-items-center">
          <TabItem
            to={isAuthenticated ? '/account/profile' : '/login'}
            label="Conta"
            icon={UserIcon}
            active={pathname.startsWith('/account') || pathname === '/login'}
          />
        </div>
      </div>
    </nav>
  )
}
