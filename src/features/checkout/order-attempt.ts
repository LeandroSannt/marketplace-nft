import type { CreateOrderRequest } from '@/contracts/order'

const ATTEMPT_KEY = 'kurio:checkout:attempt'

interface OrderAttempt {
  idempotencyKey: string
  fingerprint: string
}

function fingerprintOf(request: CreateOrderRequest) {
  return JSON.stringify(request)
}

function readAttempt(): OrderAttempt | null {
  try {
    const raw = window.sessionStorage.getItem(ATTEMPT_KEY)
    return raw ? (JSON.parse(raw) as OrderAttempt) : null
  } catch {
    return null
  }
}

export function idempotencyKeyFor(request: CreateOrderRequest) {
  const fingerprint = fingerprintOf(request)
  const current = readAttempt()
  if (current?.fingerprint === fingerprint) return current.idempotencyKey
  const attempt: OrderAttempt = { idempotencyKey: crypto.randomUUID(), fingerprint }
  try {
    window.sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempt))
  } catch {
    return attempt.idempotencyKey
  }
  return attempt.idempotencyKey
}

export function clearOrderAttempt() {
  try {
    window.sessionStorage.removeItem(ATTEMPT_KEY)
  } catch {
    return
  }
}
