import { Link } from '@tanstack/react-router'
import { CheckCircle2Icon, CopyIcon, FlaskConicalIcon } from 'lucide-react'
import { toast } from 'sonner'
import { buttonVariants } from '@/components/ui/button'
import type { Order } from '@/contracts/order'
import { NETWORK_LABELS } from '@/lib/labels'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

const MARKETPLACE_CONTRACT = '0x7A42c0F1e9D3b5A8C6e2F4d1B3a5C7e9D1f319E8'

function blockNumberFrom(hash: string) {
  return 18_000_000 + (Number.parseInt(hash.slice(2, 8), 16) % 2_000_000)
}

function CopyValue({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="truncate font-mono" title={value}>
        {value}
      </span>
      <button
        type="button"
        aria-label={`Copiar ${label}`}
        className="grid size-8 shrink-0 cursor-pointer place-items-center text-text-accent"
        onClick={() => {
          void navigator.clipboard
            .writeText(value)
            .then(() => toast.success(`${label} copiado.`))
            .catch(() => toast.error('Não foi possível copiar.'))
        }}
      >
        <CopyIcon className="size-4" aria-hidden />
      </button>
    </span>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border py-4 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
      <dt className="text-body text-text-secondary">{label}</dt>
      <dd className="min-w-0 text-body">{children}</dd>
    </div>
  )
}

export function TransactionDetails({ order, hash }: { order: Order; hash: string }) {
  const timestamp = new Date(order.updatedAt).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'medium',
  })

  return (
    <article aria-labelledby="tx-title" className="flex flex-col gap-6">
      <p
        role="note"
        className="flex items-start gap-3 rounded-lg border border-amber px-4 py-3 text-body"
      >
        <FlaskConicalIcon className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden />
        Explorador simulado: esta transação existe apenas no ambiente de demonstração da Kurio e não
        pode ser consultada em uma blockchain real.
      </p>

      <header className="flex flex-col gap-2">
        <h1 id="tx-title" className="text-title font-bold">
          Detalhes da transação
        </h1>
        <p className="text-body text-text-secondary">Rede {NETWORK_LABELS[order.network]}</p>
      </header>

      <dl className="rounded-lg bg-surface-card px-6">
        <Row label="Hash da transação">
          <CopyValue value={hash} label="Hash da transação" />
        </Row>
        <Row label="Status">
          <span className="inline-flex items-center gap-2 rounded-full border border-success px-3 py-1 text-caption font-bold text-success">
            <CheckCircle2Icon className="size-4" aria-hidden />
            Sucesso
          </span>
        </Row>
        <Row label="Bloco">{blockNumberFrom(hash).toLocaleString('pt-BR')}</Row>
        <Row label="Data e hora">{timestamp}</Row>
        <Row label="De">
          <CopyValue value={order.wallet.address} label="Endereço de origem" />
        </Row>
        <Row label="Para">
          <span className="flex flex-col">
            <CopyValue value={MARKETPLACE_CONTRACT} label="Contrato do marketplace" />
            <span className="text-caption-sm text-text-secondary">
              Contrato do marketplace Kurio
            </span>
          </span>
        </Row>
        <Row label="NFTs transferidos">
          <ul className="flex flex-col gap-1">
            {order.lines.map((line) => (
              <li key={`${line.nftId}-${line.editionId}`}>
                {line.quantity} × {line.name}{' '}
                <span className="text-text-secondary">(edição {line.editionName})</span>
              </li>
            ))}
          </ul>
        </Row>
        <Row label="Valor">{formatEth(order.total)}</Row>
        <Row label="Taxa da transação">{formatEth(order.networkFee)}</Row>
      </dl>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/orders/$orderId"
          params={{ orderId: order.id }}
          className={cn(buttonVariants(), 'h-12 rounded-sm px-4')}
        >
          Voltar ao pedido
        </Link>
        <Link
          to="/"
          hash="catalogo"
          className={cn(buttonVariants({ variant: 'outline' }), 'h-12 rounded-sm px-4 text-body')}
        >
          Continuar explorando
        </Link>
      </div>
    </article>
  )
}
