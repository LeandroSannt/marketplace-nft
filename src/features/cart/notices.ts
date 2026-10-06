import type { CartImpact } from '@/features/cart/realtime'
import { compareEth, formatEth } from '@/lib/money'

export function describeCartImpact(impact: CartImpact): string {
  const item = `${impact.name} (${impact.editionName})`
  if (impact.currentAvailable === 0) return `${item} esgotou e não pode mais ser comprado.`
  if (compareEth(impact.previousPrice, impact.currentPrice) !== 0) {
    return `O preço de ${item} mudou de ${formatEth(impact.previousPrice)} para ${formatEth(impact.currentPrice)}.`
  }
  return `A disponibilidade de ${item} mudou: restam ${impact.currentAvailable}.`
}
