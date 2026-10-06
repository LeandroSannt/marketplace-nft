import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2Icon, XCircleIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth/hooks'
import { OrderReceipt } from '@/features/checkout/components/order-receipt'
import { orderQuery } from '@/features/checkout/queries'
import { toApiError } from '@/lib/api-error'
import { formatEth } from '@/lib/money'
import { useRealtimeStatus } from '@/lib/realtime'
import { requireAuth } from '@/lib/require-auth'

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: ({ location }) => {
    requireAuth(location)
  },
  head: () => ({ meta: [{ title: 'Pedido — Kurio' }] }),
  component: OrderPage,
})

const panelClass =
  'mx-auto flex w-full max-w-144.5 flex-col items-center gap-5 rounded-lg bg-surface-card p-8 text-center shadow-glow-lg'

function OrderPage() {
  const { orderId } = Route.useParams()
  const { userId } = useCurrentUser()
  const realtime = useRealtimeStatus()
  const order = useQuery({ ...orderQuery(userId ?? '', orderId), enabled: Boolean(userId) })

  if (order.isPending) {
    return (
      <div role="status" aria-label="Carregando pedido" className={panelClass}>
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (order.isError) {
    const apiError = toApiError(order.error)
    const isUnavailable = apiError.code === 'NOT_FOUND' || apiError.code === 'FORBIDDEN'
    return (
      <div role="alert" className={panelClass}>
        <h1 className="text-title font-bold">
          {apiError.code === 'FORBIDDEN'
            ? 'Acesso negado'
            : apiError.code === 'NOT_FOUND'
              ? 'Pedido não encontrado'
              : 'Não foi possível carregar o pedido'}
        </h1>
        <p className="text-body text-text-secondary">{apiError.message}</p>
        {isUnavailable ? (
          <Link to="/" className={buttonVariants()}>
            Voltar ao início
          </Link>
        ) : (
          <Button
            onClick={() => {
              void order.refetch()
            }}
          >
            Tentar novamente
          </Button>
        )}
      </div>
    )
  }

  const data = order.data

  if (data.status === 'confirmed') return <OrderReceipt order={data} />

  if (data.status === 'declined') {
    return (
      <div role="alert" className={panelClass}>
        <XCircleIcon className="size-12 text-error-foreground" aria-hidden />
        <h1 className="text-title font-bold">Pagamento recusado</h1>
        <p className="text-body text-text-secondary">
          {data.declineReason ?? 'A transação não foi concluída.'} Nenhum valor foi cobrado e seus
          itens continuam no carrinho.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/checkout" className={buttonVariants()}>
            Tentar novamente
          </Link>
          <Link to="/cart" className={buttonVariants({ variant: 'outline' })}>
            Ver carrinho
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div role="status" aria-live="polite" className={panelClass}>
      <Loader2Icon className="size-12 animate-spin text-text-accent" aria-hidden />
      <h1 className="text-title font-bold">Processando pagamento</h1>
      <p className="text-body text-text-secondary">
        Pedido {data.id} de {formatEth(data.total)} aguardando confirmação na rede. Você pode
        recarregar esta página: o status será recuperado sem criar outra compra.
      </p>
      {realtime !== 'connected' && (
        <p className="text-caption text-amber">
          Reconectando ao servidor em tempo real… o status continua sendo verificado.
        </p>
      )}
    </div>
  )
}
