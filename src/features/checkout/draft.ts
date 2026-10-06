import { z } from 'zod'
import { networkSchema } from '@/contracts/common'

const DRAFT_KEY = 'kurio:checkout:draft'

const draftSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  walletId: z.string().nullable(),
  network: networkSchema.nullable(),
})

export type CheckoutDraft = z.infer<typeof draftSchema>

export function readCheckoutDraft(): CheckoutDraft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = draftSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    return
  }
}

export function clearCheckoutDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    return
  }
}
