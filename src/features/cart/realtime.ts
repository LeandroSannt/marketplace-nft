import type { QueryClient } from '@tanstack/react-query'
import type { Cart } from '@/contracts/cart'
import type { NftUpdatedEvent } from '@/contracts/events'
import { cartKeys } from '@/features/cart/queries'
import { quoteKeys } from '@/features/checkout/queries'
import { compareEth } from '@/lib/money'

export interface CartImpact {
  name: string
  editionName: string
  previousPrice: string
  currentPrice: string
  previousAvailable: number
  currentAvailable: number
}

function patchCart(cart: Cart, event: NftUpdatedEvent, impacts: CartImpact[]): Cart {
  const items = cart.items.map((item) => {
    if (item.nftId !== event.resource.id || item.nftVersion >= event.version) return item
    const update = event.data.editions.find((edition) => edition.id === item.editionId)
    if (!update) return { ...item, nftVersion: event.version }
    const priceChanged = compareEth(update.price, item.unitPrice) !== 0
    const stockChanged = update.available !== item.available
    if (!priceChanged && !stockChanged) return { ...item, nftVersion: event.version }
    impacts.push({
      name: item.name,
      editionName: item.editionName,
      previousPrice: item.unitPrice,
      currentPrice: update.price,
      previousAvailable: item.available,
      currentAvailable: update.available,
    })
    return {
      ...item,
      unitPrice: update.price,
      available: update.available,
      nftVersion: event.version,
    }
  })
  const changed = items.some((item, index) => item !== cart.items[index])
  return changed ? { ...cart, items } : cart
}

export function applyNftUpdatedToCart(
  queryClient: QueryClient,
  event: NftUpdatedEvent,
): CartImpact[] {
  const impacts: CartImpact[] = []
  queryClient.setQueriesData<Cart>({ queryKey: cartKeys.all }, (cart) =>
    cart ? patchCart(cart, event, impacts) : cart,
  )
  if (impacts.length) void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
  return impacts
}
