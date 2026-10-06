import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCartIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CartLine } from '@/features/cart/components/cart-line'
import { CartSummary, CartSummarySkeleton } from '@/features/cart/components/cart-summary'
import { CartWallet } from '@/features/cart/components/cart-wallet'
import { CouponForm } from '@/features/cart/components/coupon-form'
import { useCart } from '@/features/cart/hooks'
import { RelatedNfts } from '@/features/catalog/components/related-nfts'
import { quoteQuery } from '@/features/checkout/queries'
import { toApiError } from '@/lib/api-error'
import { useSession } from '@/lib/session-store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/cart')({
  head: () => ({ meta: [{ title: 'Carrinho de NFTs — Kurio' }] }),
  component: CartPage,
})

function CartSkeleton() {
  return (
    <div role="status" aria-label="Carregando carrinho" className="flex flex-col gap-3">
      {Array.from({ length: 2 }, (_, index) => (
        <Skeleton key={index} className="h-25 rounded-2xl md:h-20 md:rounded-lg" />
      ))}
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-surface-card px-6 py-16 text-center">
      <ShoppingCartIcon className="size-10 text-text-accent" aria-hidden />
      <p className="text-body-xl font-bold">Seu carrinho está vazio</p>
      <p className="text-body text-text-secondary">
        Explore o catálogo e encontre seu próximo NFT.
      </p>
      <Link to="/" hash="catalogo" className={buttonVariants()}>
        Explorar NFTs
      </Link>
    </div>
  )
}

function CartPage() {
  const { userId } = useSession()
  const cart = useCart()
  const hasItems = Boolean(cart.data?.items.length)
  const quote = useQuery({
    ...quoteQuery(cart.scope, 'ethereum', 'cart'),
    enabled: hasItems,
    placeholderData: keepPreviousData,
  })
  const issues = quote.data?.issues ?? []
  const blocked =
    issues.length > 0 || Boolean(cart.data?.items.some((item) => item.quantity > item.available))
  const canCheckout = hasItems && quote.isSuccess && !blocked && !quote.isFetching

  return (
    <div className="flex flex-col gap-12 lg:gap-24">
      <section aria-labelledby="cart-title" className="flex flex-col gap-6">
        <h1 id="cart-title" className="text-title font-bold">
          Carrinho de NFTs
        </h1>

        {cart.isPending && <CartSkeleton />}

        {cart.isError && (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-lg bg-surface-card px-6 py-16 text-center"
          >
            <p className="text-body-xl font-bold">Não foi possível carregar o carrinho</p>
            <p className="text-body text-text-secondary">{toApiError(cart.error).message}</p>
            <Button
              onClick={() => {
                void cart.refetch()
              }}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {cart.isSuccess && !hasItems && <EmptyCart />}

        {cart.isSuccess && hasItems && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,782px)_332px] lg:justify-between">
            <div className="flex flex-col gap-3">
              <div
                aria-hidden
                className="hidden grid-cols-[minmax(0,1fr)_110px_120px_110px_44px] gap-x-4 border-b border-border pb-3 text-body-md font-medium text-text-secondary md:grid"
              >
                <span>Item</span>
                <span>Preço</span>
                <span>Qtd.</span>
                <span className="text-right">Total</span>
                <span />
              </div>
              <ul aria-label="Itens do carrinho" className="flex flex-col gap-3">
                {cart.data.items.map((item) => (
                  <CartLine
                    key={`${item.nftId}-${item.editionId}`}
                    item={item}
                    scope={cart.scope}
                    issue={issues.find(
                      (issue) => issue.nftId === item.nftId && issue.editionId === item.editionId,
                    )}
                  />
                ))}
              </ul>
            </div>

            <aside
              aria-label="Resumo do pedido"
              className="-mx-4 flex flex-col gap-6 rounded-t-pill bg-surface-card px-6 pt-6 pb-9 shadow-sheet sm:-mx-6 lg:mx-0 lg:rounded-lg lg:shadow-none"
            >
              <CartWallet userId={userId} />
              <CouponForm scope={cart.scope} appliedCode={cart.data.couponCode} />
              {quote.isPending ? <CartSummarySkeleton /> : <CartSummary quote={quote} />}
              {blocked && (
                <p role="status" className="text-body text-text-coral">
                  Ajuste os itens indisponíveis para continuar.
                </p>
              )}
              <Link
                to="/checkout"
                disabled={!canCheckout}
                aria-disabled={!canCheckout}
                className={cn(
                  buttonVariants({ variant: 'cta', size: 'pill' }),
                  'lg:h-10 lg:rounded-xs lg:bg-primary lg:bg-none',
                  !canCheckout && 'pointer-events-none opacity-50',
                )}
              >
                Finalizar compra
              </Link>
            </aside>
          </div>
        )}
      </section>

      <RelatedNfts title="Você também pode gostar" />
    </div>
  )
}
