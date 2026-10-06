import { useNavigate } from '@tanstack/react-router'
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

  const handleBuy = () => {
    addToCart.mutate(
      { nftId: nft.id, editionId: edition.id, quantity: safeQuantity },
      {
        onSuccess: () => {
          toast.success(`${nft.name} (${edition.name}) foi adicionado ao carrinho.`)
          void navigate({ to: '/cart' })
        },
        onError: (error) => {
          toast.error(toApiError(error).message)
        },
      },
    )
  }

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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <QuantityStepper
          size="lg"
          label={nft.name}
          value={safeQuantity}
          max={max}
          disabled={soldOut || reachedLimit}
          onChange={setQuantity}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleBuy}
            disabled={soldOut || reachedLimit || addToCart.isPending}
            aria-busy={addToCart.isPending}
            className="h-10 w-32.5 text-body font-bold uppercase"
          >
            {soldOut ? 'Esgotado' : addToCart.isPending ? 'Adicionando…' : 'Comprar'}
          </Button>
          {favoriteAction}
        </div>
      </div>

      {reachedLimit && (
        <p role="status" className="text-body text-text-coral">
          Você já tem o limite desta edição no carrinho.
        </p>
      )}
    </div>
  )
}
