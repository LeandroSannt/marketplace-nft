import { Link } from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { NftImage } from '@/components/nft-image'
import { QuantityStepper } from '@/components/quantity-stepper'
import type { CartItem } from '@/contracts/cart'
import type { QuoteIssue } from '@/contracts/quote'
import { useRemoveCartItem, useUpdateCartItem, type CartScope } from '@/features/cart/queries'
import { toApiError } from '@/lib/api-error'
import { formatEth, multiplyEth } from '@/lib/money'

interface CartLineProps {
  item: CartItem
  scope: CartScope
  issue?: QuoteIssue
}

function issueMessage(issue: QuoteIssue | undefined, item: CartItem) {
  if (item.available === 0 || issue?.type === 'OUT_OF_STOCK') {
    return 'Esgotado. Remova este item para continuar.'
  }
  if (issue?.type === 'QUANTITY_REDUCED' || item.quantity > item.available) {
    return `Apenas ${item.available} disponíveis. Ajuste a quantidade.`
  }
  return null
}

export function CartLine({ item, scope, issue }: CartLineProps) {
  const update = useUpdateCartItem(scope)
  const remove = useRemoveCartItem(scope)
  const busy = update.isPending || remove.isPending
  const max = Math.max(1, Math.min(item.maxPerOrder, item.available))
  const warning = issueMessage(issue, item)
  const warningId = `cart-warning-${item.nftId}-${item.editionId}`

  const handleQuantity = (quantity: number) => {
    update.mutate(
      { nftId: item.nftId, editionId: item.editionId, quantity },
      {
        onError: (error) => {
          toast.error(toApiError(error).message)
        },
      },
    )
  }

  const handleRemove = () => {
    remove.mutate(
      { nftId: item.nftId, editionId: item.editionId },
      {
        onSuccess: () => {
          toast.success(`${item.name} (${item.editionName}) saiu do carrinho.`)
        },
        onError: (error) => {
          toast.error(toApiError(error).message)
        },
      },
    )
  }

  return (
    <li
      aria-busy={busy}
      aria-describedby={warning ? warningId : undefined}
      className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-x-4 gap-y-2 overflow-hidden rounded-2xl bg-gradient-card pr-4 shadow-card md:grid-cols-[minmax(0,1fr)_110px_120px_110px_44px] md:rounded-none md:bg-none md:p-0 md:shadow-none"
    >
      <div className="row-span-2 flex items-center gap-4 md:row-span-1">
        <NftImage
          artwork={item.artwork}
          alt=""
          sizes="100px"
          width={100}
          height={100}
          className="size-25 shrink-0 rounded-l-2xl md:size-20 md:rounded-lg"
        />
        <div className="hidden min-w-0 flex-col gap-1 md:flex">
          <Link
            to="/nfts/$nftId"
            params={{ nftId: item.nftId }}
            className="truncate text-body-md font-bold hover:text-text-accent"
          >
            {item.name}
          </Link>
          <span className="text-caption-sm text-text-secondary">Edição {item.editionName}</span>
          {warning && (
            <span id={warningId} className="text-caption-sm text-text-coral">
              {warning}
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1 pt-3 md:hidden">
        <Link
          to="/nfts/$nftId"
          params={{ nftId: item.nftId }}
          className="truncate text-body-md font-bold"
        >
          {item.name}
        </Link>
        <span className="text-caption-sm text-text-secondary">
          Edição {item.editionName} · {formatEth(item.unitPrice)}
        </span>
        {warning && (
          <span id={warningId} className="text-caption-sm text-text-coral">
            {warning}
          </span>
        )}
      </div>

      <p className="hidden text-body-lg md:block">
        <span className="sr-only">Preço unitário: </span>
        {formatEth(item.unitPrice)}
      </p>

      <div className="flex items-center justify-between pb-3 md:contents">
        <QuantityStepper
          label={item.name}
          value={Math.min(item.quantity, max)}
          max={max}
          disabled={busy || item.available === 0}
          onChange={handleQuantity}
        />
        <p className="text-body-lg font-bold text-text-accent md:text-right">
          <span className="sr-only">Total do item: </span>
          {formatEth(multiplyEth(item.unitPrice, item.quantity))}
        </p>
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          aria-label={`Remover ${item.name} (${item.editionName}) do carrinho`}
          className="grid size-11 cursor-pointer place-items-center text-text-secondary hover:text-text-coral disabled:opacity-50"
        >
          <Trash2Icon className="size-5" aria-hidden />
        </button>
      </div>
    </li>
  )
}
