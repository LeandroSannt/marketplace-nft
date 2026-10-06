export interface MergeableLine {
  nftId: string
  editionId: string
  quantity: number
}

export function mergeCartLines<T extends MergeableLine>(
  target: readonly T[],
  incoming: readonly T[],
  limitFor: (line: T) => number,
): T[] {
  const merged = target.map((line) => ({ ...line }))
  for (const line of incoming) {
    const existing = merged.find(
      (item) => item.nftId === line.nftId && item.editionId === line.editionId,
    )
    const quantity = Math.min((existing?.quantity ?? 0) + line.quantity, limitFor(line))
    if (quantity <= 0) continue
    if (existing) existing.quantity = quantity
    else merged.push({ ...line, quantity })
  }
  return merged
}
