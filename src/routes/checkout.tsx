import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { walletsQuery } from '@/features/account/queries'
import { useCurrentUser } from '@/features/auth/hooks'
import { useCart } from '@/features/cart/hooks'
import { CheckoutFlow } from '@/features/checkout/components/checkout-flow'
import { pendingOrdersQuery } from '@/features/checkout/queries'
import { requireAuth } from '@/lib/require-auth'

export const Route = createFileRoute('/checkout')({
  beforeLoad: ({ location }) => {
    requireAuth(location)
  },
  head: () => ({ meta: [{ title: 'Pagamento — Kurio' }] }),
  component: CheckoutPage,
})

function CheckoutSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando pagamento"
      className="grid gap-8 lg:grid-cols-[1fr_400px]"
    >
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10" />
        <Skeleton className="h-23.25 rounded-2xl" />
        <Skeleton className="h-23.25 rounded-2xl" />
      </div>
      <Skeleton className="h-80 rounded-lg" />
    </div>
  )
}

function CheckoutPage() {
  const { user, userId } = useCurrentUser()
  const cart = useCart()
  const wallets = useQuery({ ...walletsQuery(userId ?? ''), enabled: Boolean(userId) })
  const pending = useQuery({ ...pendingOrdersQuery(userId ?? ''), enabled: Boolean(userId) })
  const ready = user && wallets.data && cart.data
  const [entered, setEntered] = useState(false)
  if (ready && cart.data.items.length > 0 && !entered) setEntered(true)

  return (
    <section aria-labelledby="checkout-title" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 id="checkout-title" className="text-title font-bold">
          Pagamento com carteira
        </h1>
        <p className="text-body text-text-secondary">
          Confirme seus dados, conecte sua carteira e revise o pedido antes de enviar.
        </p>
      </div>

      {!ready && <CheckoutSkeleton />}

      {ready && !entered && (
        <div className="flex flex-col items-center gap-4 rounded-lg bg-surface-card px-6 py-16 text-center">
          <p className="text-body-xl font-bold">Seu carrinho está vazio</p>
          <Link to="/" hash="catalogo" className={buttonVariants()}>
            Explorar NFTs
          </Link>
        </div>
      )}

      {ready && entered && (
        <CheckoutFlow
          user={user}
          wallets={wallets.data.items}
          pendingOrderId={pending.data?.items[0]?.id ?? null}
        />
      )}
    </section>
  )
}
