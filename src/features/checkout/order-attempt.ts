import { z } from 'zod'
import type { CreateOrderRequest } from '@/contracts/order'

const ATTEMPT_KEY_PREFIX = 'kurio:checkout:attempt'

const attemptSchema = z.object({
  idempotencyKey: z.string(),
  fingerprint: z.string(),
})

type OrderAttempt = z.infer<typeof attemptSchema>

function attemptKey(userId: string) {
  return `${ATTEMPT_KEY_PREFIX}:${userId}`
}

function fingerprintOf(request: CreateOrderRequest) {
  return JSON.stringify(request)
}

function readAttempt(userId: string): OrderAttempt | null {
  try {
    const raw = window.sessionStorage.getItem(attemptKey(userId))
    if (!raw) return null
    const parsed = attemptSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function idempotencyKeyFor(userId: string, request: CreateOrderRequest) {
  const fingerprint = fingerprintOf(request)
  const current = readAttempt(userId)
  if (current?.fingerprint === fingerprint) return current.idempotencyKey
  const attempt: OrderAttempt = { idempotencyKey: crypto.randomUUID(), fingerprint }
  try {
    window.sessionStorage.setItem(attemptKey(userId), JSON.stringify(attempt))
  } catch {
    return attempt.idempotencyKey
  }
  return attempt.idempotencyKey
}

export function clearOrderAttempt(userId: string) {
  try {
    window.sessionStorage.removeItem(attemptKey(userId))
  } catch {
    return
  }
}
