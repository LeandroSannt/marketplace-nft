import { useNavigate } from '@tanstack/react-router'
import { ShoppingCartIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { QuantityStepper } from '@/components/quantity-stepper'
import { Button } from '@/components/ui/button'
import type { NftDetail } from '@/contracts/nft'
import { useCart } from '@/features/cart/hooks'
import { useAddToCart } from '@/features/cart/queries'
import { EditionPicker } from '@/features/catalog/components/edition-picker'
import { toApiError } from '@/lib/api-error'
import { formatEth } from '@/lib/money'

function firstAvailableEdition(nft: NftDetail) {
  return (nft.editions.find((edition) => edition.available > 0) ?? nft.editions[0])?.id ?? ''
}

interface NftPurchasePanelProps {
  nft: NftDetail
  favoriteAction: React.ReactNode
}

export function NftPurchasePanel({ nft, favoriteAction }: NftPurchasePanelProps) {
  const navigate = useNavigate()
  const { data: cart, scope } = useCart()
  const addToCart = useAddToCart(scope)
  const [editionId, setEditionId] = useState(() => firstAvailableEdition(nft))
  const [quantity, setQuantity] = useState(1)

  const edition = nft.editions.find((item) => item.id === editionId) ?? nft.editions[0]
  if (!edition) return null

  const inCart =
    cart?.items.find((item) => item.nftId === nft.id && item.editionId === edition.id)?.quantity ??
    0
  const limit = Math.min(edition.maxPerOrder, edition.available)
  const max = Math.max(0, limit - inCart)
  const soldOut = edition.available === 0
  const reachedLimit = !soldOut && max === 0
  const safeQuantity = Math.min(Math.max(quantity, 1), Math.max(max, 1))

  const handleAdd = (goToCart: boolean) => {
    addToCart.mutate(
      { nftId: nft.id, editionId: edition.id, quantity: safeQuantity },
      {
        onSuccess: () => {
          toast.success(`${nft.name} (${edition.name}) foi adicionado ao carrinho.`)
          if (goToCart) void navigate({ to: '/cart' })
        },
        onError: (error) => {
          toast.error(toApiError(error).message)
        },
      },
    )
  }

  const cannotBuy = soldOut || reachedLimit || addToCart.isPending

  return (
    <div className="flex flex-col gap-6">
      <EditionPicker
        editions={nft.editions}
        selectedId={edition.id}
        onSelect={(id) => {
          setEditionId(id)
          setQuantity(1)
        }}
      />

      <p aria-live="polite" className="text-body text-text-secondary">
        {soldOut
          ? `A edição ${edition.name} está esgotada.`
          : `Edição ${edition.name}: ${formatEth(edition.price)} · ${edition.available} disponíveis · máximo de ${edition.maxPerOrder} por pedido${inCart ? ` · ${inCart} no carrinho` : ''}`}
      </p>

      {reachedLimit && (
        <p role="status" className="text-body text-text-coral md:order-last">
          Você já tem o limite desta edição no carrinho.
        </p>
      )}

      <div className="flex flex-col gap-4 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-40 max-md:rounded-t-[30px] max-md:bg-surface-card max-md:px-6 max-md:pt-5 max-md:pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-md:shadow-sheet md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span aria-hidden className="text-body md:hidden">
              Qtd.
            </span>
            <QuantityStepper
              size="lg"
              label={nft.name}
              value={safeQuantity}
              max={max}
              disabled={soldOut || reachedLimit}
              onChange={setQuantity}
            />
          </div>
          <p className="text-body-xl font-bold text-text-accent md:hidden">
            {formatEth(edition.price)}
          </p>
        </div>
        <div className="flex items-center gap-3 md:gap-2">
          <Button
            onClick={() => {
              handleAdd(true)
            }}
            disabled={cannotBuy}
            aria-busy={addToCart.isPending}
            className="text-body font-bold max-md:h-15 max-md:w-49 max-md:rounded-pill max-md:bg-gradient-cta md:h-10 md:w-32.5 md:uppercase"
          >
            {soldOut ? (
              'Esgotado'
            ) : addToCart.isPending ? (
              'Adicionando…'
            ) : (
              <>
                <span className="md:hidden">Comprar NFT</span>
                <span className="hidden md:inline">Comprar</span>
              </>
            )}
          </Button>
          <button
            type="button"
            aria-label="Adicionar ao carrinho sem sair da página"
            disabled={cannotBuy}
            onClick={() => {
              handleAdd(false)
            }}
            className="grid size-15 cursor-pointer place-items-center rounded-full bg-surface-raised text-primary disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
          >
            <ShoppingCartIcon className="size-6" aria-hidden />
          </button>
          <div className="hidden md:block">{favoriteAction}</div>
        </div>
      </div>
    </div>
  )
}
