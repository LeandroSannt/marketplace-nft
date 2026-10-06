export function createRandom(seed: number) {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(items: readonly T[]): T => {
      const item = items[Math.floor(next() * items.length)]
      if (item === undefined) throw new Error('Cannot pick from an empty list')
      return item
    },
  }
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
}

export function hexFrom(input: string, length: number) {
  let hash = 0x811c9dc5
  let output = ''
  while (output.length < length) {
    for (const char of `${input}${output.length}`) {
      hash ^= char.charCodeAt(0)
      hash = Math.imul(hash, 0x01000193) >>> 0
    }
    output += hash.toString(16).padStart(8, '0')
  }
  return output.slice(0, length)
}
