import { accountHandlers } from '@/mocks/handlers/account'
import { authHandlers } from '@/mocks/handlers/auth'
import { cartHandlers } from '@/mocks/handlers/cart'
import { catalogHandlers } from '@/mocks/handlers/catalog'
import { checkoutHandlers } from '@/mocks/handlers/checkout'
import { favoritesHandlers } from '@/mocks/handlers/favorites'
import { realtimeHandler } from '@/mocks/realtime'

export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...favoritesHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
  ...accountHandlers,
  realtimeHandler,
]
