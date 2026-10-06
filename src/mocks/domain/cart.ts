import type { Cart, CartItem } from '@/contracts/cart'
import { db, persist, type CartLine, type CartRecord, type UserRecord } from '@/mocks/db'
import { findNft } from '@/mocks/domain/catalog'
import { MockHttpError, notFound } from '@/mocks/lib/http'
import { createId } from '@/mocks/lib/random'
import { mergeCartLines } from '@/lib/cart-merge'

export const GUEST_CART_HEADER = 'X-Cart-Id'

export function findEdition(nftId: string, editionId: string) {
  const nft = findNft(nftId)
  const edition = nft?.editions.find((item) => item.id === editionId)
  if (!nft || !edition) throw notFound('NFT ou edição não encontrado')
  return { nft, edition }
}

function createCart(ownerId: string | null): CartRecord {
  const cart: CartRecord = {
    id: createId('cart'),
    ownerId,
    items: [],
    couponCode: null,
    version: 0,
  }
  db().carts[cart.id] = cart
  return cart
}

export function userCart(userId: string): CartRecord {
  return Object.values(db().carts).find((cart) => cart.ownerId === userId) ?? createCart(userId)
}

export function resolveCart(request: Request, user: UserRecord | null): CartRecord {
  if (user) return userCart(user.id)
  const guestId = request.headers.get(GUEST_CART_HEADER)
  const existing = guestId ? db().carts[guestId] : undefined
  if (existing && existing.ownerId === null) return existing
  return createCart(null)
}

export function toCartResponse(cart: CartRecord): Cart {
  const items = cart.items.flatMap((line): CartItem[] => {
    const nft = findNft(line.nftId)
    const edition = nft?.editions.find((item) => item.id === line.editionId)
    if (!nft || !edition) return []
    return [
      {
        nftId: nft.id,
        editionId: edition.id,
        name: nft.name,
        editionName: edition.name,
        artwork: nft.artwork,
        network: nft.network,
        quantity: line.quantity,
        unitPrice: edition.price,
        available: edition.available,
        maxPerOrder: edition.maxPerOrder,
        nftVersion: nft.version,
      },
    ]
  })
  return { id: cart.id, items, couponCode: cart.couponCode, version: cart.version }
}

function assertQuantity(nftId: string, editionId: string, quantity: number) {
  const { edition } = findEdition(nftId, editionId)
  if (edition.available === 0) {
    throw new MockHttpError(409, 'OUT_OF_STOCK', 'Esta edição está esgotada')
  }
  if (quantity > edition.maxPerOrder) {
    throw new MockHttpError(
      409,
      'QUANTITY_LIMIT',
      `O limite desta edição é de ${edition.maxPerOrder} por pedido`,
      undefined,
      { max: edition.maxPerOrder },
    )
  }
  if (quantity > edition.available) {
    throw new MockHttpError(
      409,
      'OUT_OF_STOCK',
      `Apenas ${edition.available} disponíveis desta edição`,
      undefined,
      { available: edition.available },
    )
  }
}

function touch(cart: CartRecord) {
  cart.version += 1
  persist()
  return cart
}

function findLine(cart: CartRecord, nftId: string, editionId: string) {
  return cart.items.find((line) => line.nftId === nftId && line.editionId === editionId)
}

export function addLine(cart: CartRecord, line: CartLine) {
  const existing = findLine(cart, line.nftId, line.editionId)
  const quantity = (existing?.quantity ?? 0) + line.quantity
  assertQuantity(line.nftId, line.editionId, quantity)
  if (existing) existing.quantity = quantity
  else cart.items.push({ ...line })
  return touch(cart)
}

export function setLineQuantity(
  cart: CartRecord,
  nftId: string,
  editionId: string,
  quantity: number,
) {
  const line = findLine(cart, nftId, editionId)
  if (!line) throw notFound('Item não está no carrinho')
  assertQuantity(nftId, editionId, quantity)
  line.quantity = quantity
  return touch(cart)
}

export function removeLine(cart: CartRecord, nftId: string, editionId: string) {
  const before = cart.items.length
  cart.items = cart.items.filter((line) => !(line.nftId === nftId && line.editionId === editionId))
  if (cart.items.length === before) throw notFound('Item não está no carrinho')
  return touch(cart)
}

export function setCoupon(cart: CartRecord, code: string | null) {
  cart.couponCode = code
  return touch(cart)
}

export function mergeGuestCart(target: CartRecord, guestCartId: string) {
  const guest = db().carts[guestCartId]
  if (!guest || guest.ownerId !== null || guest.id === target.id) return target
  target.items = mergeCartLines(target.items, guest.items, (line) => {
    const { edition } = findEdition(line.nftId, line.editionId)
    return Math.min(edition.maxPerOrder, edition.available)
  })
  if (!target.couponCode && guest.couponCode) target.couponCode = guest.couponCode
  db().carts = Object.fromEntries(Object.entries(db().carts).filter(([id]) => id !== guest.id))
  return touch(target)
}

export function removePurchased(cart: CartRecord, purchased: CartLine[]) {
  for (const bought of purchased) {
    const line = findLine(cart, bought.nftId, bought.editionId)
    if (!line) continue
    line.quantity -= bought.quantity
  }
  cart.items = cart.items.filter((line) => line.quantity > 0)
  return touch(cart)
}
