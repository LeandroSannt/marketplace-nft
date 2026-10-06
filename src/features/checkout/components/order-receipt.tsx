import { Link, useNavigate } from '@tanstack/react-router'
import { CheckCircle2Icon, CopyIcon, ScanSearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import { buttonVariants } from '@/components/ui/button'
import type { Order } from '@/contracts/order'
import { NETWORK_LABELS } from '@/lib/labels'
import { OrderLines } from '@/features/checkout/components/order-lines'
import { OrderTotals } from '@/features/checkout/components/order-totals'
import { cn } from '@/lib/utils'

function shortHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`
}

export function OrderReceipt({ order }: { order: Order }) {
  const navigate = useNavigate()
  const explorerUrl = order.explorerUrl
  const confirmedAt = new Date(order.updatedAt).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <article
      aria-labelledby="receipt-title"
      className="mx-auto flex w-full max-w-144.5 flex-col gap-6 rounded-lg bg-surface-card p-6 shadow-glow-lg md:p-11"
    >
      <header className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2Icon className="size-12 text-success" aria-hidden />
        <h1 id="receipt-title" className="text-title font-bold">
          Pedido confirmado
        </h1>
        <p className="text-body text-text-secondary">
          Pagamento confirmado em {confirmedAt}. Os NFTs já estão na sua carteira.
        </p>
      </header>

      <dl className="grid gap-3 rounded-lg bg-surface-raised p-4 text-body">
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Pedido</dt>
          <dd className="font-bold">{order.id}</dd>
        </div>
        {order.transactionHash && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Transação</dt>
            <dd className="flex items-center gap-2 font-bold">
              <span title={order.transactionHash}>{shortHash(order.transactionHash)}</span>
              <button
                type="button"
                aria-label="Copiar identificador da transação"
                className="grid size-8 cursor-pointer place-items-center text-text-accent"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(order.transactionHash ?? '')
                    .then(() => toast.success('Identificador copiado.'))
                    .catch(() => toast.error('Não foi possível copiar.'))
                }}
              >
                <CopyIcon className="size-4" aria-hidden />
              </button>
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Carteira</dt>
          <dd>{order.wallet.label}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Rede</dt>
          <dd>{NETWORK_LABELS[order.network]}</dd>
        </div>
      </dl>

      <section aria-labelledby="receipt-items" className="flex flex-col gap-4">
        <div className="flex justify-between text-body-md font-medium text-text-secondary">
          <h2 id="receipt-items">Itens</h2>
          <span aria-hidden>Total</span>
        </div>
        <OrderLines lines={order.lines} />
      </section>

      <OrderTotals {...order} />

      <footer className="flex flex-col gap-4 border-t border-border pt-6">
        <p className="text-caption text-text-secondary">
          Um recibo foi enviado para {order.buyer.email}. Os valores acima refletem o momento da
          compra e não mudam com alterações futuras no catálogo. Referência e link de exploração
          simulados.
        </p>
        <div className="flex flex-wrap gap-3">
          {explorerUrl && (
            <a
              href={explorerUrl}
              onClick={(event) => {
                event.preventDefault()
                void navigate({ href: explorerUrl })
              }}
              className={cn(buttonVariants(), 'h-12 gap-2 rounded-sm px-4')}
            >
              Ver no explorador
              <ScanSearchIcon className="size-4" aria-hidden />
            </a>
          )}
          <Link
            to="/"
            hash="catalogo"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-12 rounded-sm px-4 text-body')}
          >
            Continuar explorando
          </Link>
        </div>
      </footer>
    </article>
  )
}
