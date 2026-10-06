import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Link, Outlet } from '@tanstack/react-router'
import { BackgroundRefreshIndicator } from '@/components/layout/background-refresh-indicator'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { buttonVariants } from '@/components/ui/button'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col px-4 pt-4 pb-36 sm:px-6 lg:px-10 lg:pt-0 lg:pb-6">
      <HeadContent />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-ink"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto min-h-dvh w-full max-w-content flex-1 pb-12 outline-none lg:pt-8 lg:pb-24"
      >
        <Outlet />
      </main>
      <SiteFooter />
      <MobileTabBar />
      <BackgroundRefreshIndicator />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="text-display font-bold text-text-accent">404</p>
      <h1 className="text-heading font-bold">Página não encontrada</h1>
      <p className="text-text-secondary">O endereço acessado não existe ou foi removido.</p>
      <Link to="/" className={buttonVariants()}>
        Voltar ao início
      </Link>
    </div>
  )
}
