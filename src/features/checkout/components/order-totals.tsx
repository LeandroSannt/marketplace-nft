import type { Network } from '@/contracts/common'
import { NETWORK_LABELS } from '@/lib/labels'
import { formatEth, isZeroEth } from '@/lib/money'

interface OrderTotalsProps {
  subtotal: string
  discount: string
  networkFee: string
  total: string
  network: Network
  coupon: { code: string; percentOff: number } | null
}

export function OrderTotals({
  subtotal,
  discount,
  networkFee,
  total,
  network,
  coupon,
}: OrderTotalsProps) {
  return (
    <dl className="flex flex-col gap-3 text-body-md">
      <div className="flex justify-between gap-4">
        <dt>Subtotal</dt>
        <dd>{formatEth(subtotal)}</dd>
      </div>
      {coupon && !isZeroEth(discount) && (
        <div className="flex justify-between gap-4">
          <dt>
            Desconto {coupon.code} ({coupon.percentOff}%)
          </dt>
          <dd>− {formatEth(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="flex flex-col">
          Taxa de rede
          <span className="text-caption-sm text-text-accent">{NETWORK_LABELS[network]}</span>
        </dt>
        <dd>{formatEth(networkFee)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-border pt-3 text-body-xl font-bold">
        <dt>Total</dt>
        <dd className="text-text-accent">{formatEth(total)}</dd>
      </div>
    </dl>
  )
}
