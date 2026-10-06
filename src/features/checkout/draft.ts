import { z } from 'zod'
import { networkSchema } from '@/contracts/common'

const DRAFT_KEY_PREFIX = 'kurio:checkout:draft'

const draftSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  walletId: z.string().nullable(),
  network: networkSchema.nullable(),
})

export type CheckoutDraft = z.infer<typeof draftSchema>

function draftKey(userId: string) {
  return `${DRAFT_KEY_PREFIX}:${userId}`
}

export function readCheckoutDraft(userId: string): CheckoutDraft | null {
  try {
    const raw = window.sessionStorage.getItem(draftKey(userId))
    if (!raw) return null
    const parsed = draftSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveCheckoutDraft(userId: string, draft: CheckoutDraft) {
  try {
    window.sessionStorage.setItem(draftKey(userId), JSON.stringify(draft))
  } catch {
    return
  }
}

export function clearCheckoutDraft(userId: string) {
  try {
    window.sessionStorage.removeItem(draftKey(userId))
  } catch {
    return
  }
}
