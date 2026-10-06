import { useSyncExternalStore } from 'react'

const TOKEN_KEY = 'kurio:session'
const GUEST_CART_KEY = 'kurio:guest-cart'

export interface SessionSnapshot {
  token: string | null
  userId: string | null
  expired: boolean
}

type Listener = () => void

function readStoredSession(): SessionSnapshot {
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY)
    if (!raw) return { token: null, userId: null, expired: false }
    const parsed = JSON.parse(raw) as { token?: unknown; userId?: unknown }
    if (typeof parsed.token === 'string' && typeof parsed.userId === 'string') {
      return { token: parsed.token, userId: parsed.userId, expired: false }
    }
  } catch {
    return { token: null, userId: null, expired: false }
  }
  return { token: null, userId: null, expired: false }
}

let snapshot = readStoredSession()
const listeners = new Set<Listener>()

function update(next: SessionSnapshot) {
  snapshot = next
  try {
    if (next.token && next.userId) {
      window.localStorage.setItem(
        TOKEN_KEY,
        JSON.stringify({ token: next.token, userId: next.userId }),
      )
    } else {
      window.localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    return
  } finally {
    for (const listener of listeners) listener()
  }
}

export const sessionStore = {
  get: () => snapshot,
  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  start(token: string, userId: string) {
    update({ token, userId, expired: false })
  },
  expire() {
    if (!snapshot.token) return
    update({ token: null, userId: null, expired: true })
  },
  clear() {
    update({ token: null, userId: null, expired: false })
  },
  acknowledgeExpiration() {
    if (snapshot.expired) update({ ...snapshot, expired: false })
  },
}

export function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get)
}

export const guestCartStore = {
  get() {
    try {
      return window.localStorage.getItem(GUEST_CART_KEY)
    } catch {
      return null
    }
  },
  set(cartId: string) {
    try {
      window.localStorage.setItem(GUEST_CART_KEY, cartId)
    } catch {
      return
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(GUEST_CART_KEY)
    } catch {
      return
    }
  },
}
