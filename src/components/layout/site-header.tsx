import { Link, useRouterState } from '@tanstack/react-router'
import { AccountMenu } from '@/components/layout/account-menu'
import { Brand } from '@/components/layout/brand'
import { CartLink } from '@/components/layout/cart-link'
import { HeaderSearch } from '@/components/layout/header-search'
import { announceComingSoon } from '@/lib/coming-soon'
import { cn } from '@/lib/utils'

const MARKET_PATHS = ['/nfts', '/cart', '/checkout', '/orders', '/explorer']

const navItemClass =
  'flex flex-col items-center gap-6 text-body-lg text-foreground hover:text-text-accent'

function ActiveMarker({ active }: { active: boolean }) {
  return (
    <span aria-hidden className={cn('h-px w-full', active ? 'bg-primary' : 'bg-transparent')} />
  )
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isMarket = MARKET_PATHS.some((path) => pathname.startsWith(path))
  const isHome = !isMarket

  return (
    <header className="mx-auto hidden w-full max-w-content pt-6 lg:block">
      <div className="flex h-[45px] items-start justify-between border-b border-border">
        <Brand className="w-40 pt-1" />
        <nav aria-label="Principal" className="flex gap-10">
          <Link
            to="/"
            aria-current={isHome ? 'page' : undefined}
            className={cn(navItemClass, isHome && 'font-bold text-text-accent')}
          >
            Início
            <ActiveMarker active={isHome} />
          </Link>
          <Link
            to="/"
            hash="catalogo"
            aria-current={isMarket ? 'page' : undefined}
            className={cn(navItemClass, isMarket && 'font-bold text-text-accent')}
          >
            Mercado
            <ActiveMarker active={isMarket} />
          </Link>
          <button
            type="button"
            onClick={() => {
              announceComingSoon('A página de criadores')
            }}
            className={cn(navItemClass, 'cursor-pointer')}
          >
            Criadores
            <ActiveMarker active={false} />
          </button>
          <button
            type="button"
            onClick={() => {
              announceComingSoon('A central de aprendizado')
            }}
            className={cn(navItemClass, 'cursor-pointer')}
          >
            Aprenda
            <ActiveMarker active={false} />
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <HeaderSearch />
          <CartLink />
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
