import type { UseQueryResult } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Quote } from '@/contracts/quote'
import { toApiError } from '@/lib/api-error'
import { formatEth, isZeroEth } from '@/lib/money'

interface CartSummaryProps {
  quote: UseQueryResult<Quote>
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex flex-col">
        <span className="text-body-md">{label}</span>
        {hint && <span className="text-caption-sm text-text-accent">{hint}</span>}
      </dt>
      <dd className="text-body-lg">{value}</dd>
    </div>
  )
}

export function CartSummarySkeleton() {
  return (
    <div role="status" aria-label="Calculando resumo" className="flex flex-col gap-4">
      <div className="flex h-5 items-center justify-between gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-36" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="box-content flex h-6 items-center justify-between border-t border-border pt-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  )
}

export function CartSummary({ quote }: CartSummaryProps) {
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = quote

  if (isPending) return <CartSummarySkeleton />

  if (isError) {
    return (
      <div role="alert" className="flex flex-col gap-3">
        <p className="text-body text-text-secondary">{toApiError(error).message}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void refetch()
          }}
        >
          Recalcular resumo
        </Button>
      </div>
    )
  }

  return (
    <dl
      aria-busy={isFetching || isPlaceholderData}
      aria-live="polite"
      className="flex flex-col gap-4"
    >
      <Row
        label={`Subtotal (${data.lines.reduce((sum, line) => sum + line.quantity, 0)} itens)`}
        value={formatEth(data.subtotal)}
      />
      {data.coupon && !isZeroEth(data.discount) && (
        <Row
          label={`Desconto ${data.coupon.code} (${data.coupon.percentOff}%)`}
          value={`− ${formatEth(data.discount)}`}
        />
      )}
      <Row
        label="Taxa de rede"
        hint="Taxa estimada (Ethereum)"
        value={formatEth(data.networkFee)}
      />
      <div className="flex items-center justify-between border-t border-border pt-4">
        <dt className="text-body-xl font-bold">Total</dt>
        <dd className="text-body-xl font-bold text-text-accent">{formatEth(data.total)}</dd>
      </div>
    </dl>
  )
}
