import { redirect, type ParsedLocation } from '@tanstack/react-router'
import { sessionStore } from '@/lib/session-store'

const PRIVATE_PATHS = ['/account', '/checkout', '/orders', '/explorer']

export function isPrivatePath(href: string) {
  return PRIVATE_PATHS.some(
    (path) => href === path || href.startsWith(`${path}/`) || href.startsWith(`${path}?`),
  )
}

export function requireAuth(location: ParsedLocation) {
  if (sessionStore.get().token) return
  throw redirect({ to: '/login', search: { redirect: location.href } })
}
