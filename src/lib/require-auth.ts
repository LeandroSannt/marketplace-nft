import { redirect, type ParsedLocation } from '@tanstack/react-router'
import { sessionStore } from '@/lib/session-store'

export function requireAuth(location: ParsedLocation) {
  if (sessionStore.get().token) return
  throw redirect({ to: '/login', search: { redirect: location.href } })
}
