import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth/hooks'
import { TransactionDetails } from '@/features/checkout/components/transaction-details'
import { orderQuery } from '@/features/checkout/queries'
import { toApiError } from '@/lib/api-error'
import { requireAuth } from '@/lib/require-auth'

const explorerSearchSchema = z.object({
  order: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/explorer/tx/$hash')({
  validateSearch: explorerSearchSchema,
  beforeLoad: ({ location }) => {
    requireAuth(location)
  },
  head: () => ({ meta: [{ title: 'Transação — Explorador simulado Kurio' }] }),
  component: TransactionPage,
})

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-5 py-24 text-center">
      <h1 className="text-title font-bold">Transação não encontrada</h1>
      <p className="text-body text-text-secondary">
        Este hash não corresponde a nenhuma transação do ambiente de demonstração.
      </p>
      <Link to="/" className={buttonVariants()}>
        Voltar ao início
      </Link>
    </div>
  )
}

function TransactionPage() {
  const { hash } = Route.useParams()
  const { order: orderId } = Route.useSearch()
  const { userId } = useCurrentUser()
  const order = useQuery({
    ...orderQuery(userId ?? '', orderId ?? ''),
    enabled: Boolean(userId && orderId),
  })

  if (!orderId) return <NotFound />

  if (order.isPending) {
    return (
      <div role="status" aria-label="Carregando transação" className="flex flex-col gap-4">
        <Skeleton className="h-14" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (order.isError) {
    const apiError = toApiError(order.error)
    if (apiError.code === 'NOT_FOUND' || apiError.code === 'FORBIDDEN') return <NotFound />
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-body text-text-secondary">{apiError.message}</p>
        <Button
          onClick={() => {
            void order.refetch()
          }}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (order.data.transactionHash !== hash) return <NotFound />

  return <TransactionDetails order={order.data} hash={hash} />
}
