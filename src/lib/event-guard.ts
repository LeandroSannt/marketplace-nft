interface VersionedEvent {
  eventId: string
  version: number
  resource: { type: string; id: string }
}

const MAX_TRACKED_EVENTS = 500

export function createEventGuard() {
  const seen = new Set<string>()
  const versions = new Map<string, number>()

  return {
    accept(event: VersionedEvent) {
      if (seen.has(event.eventId)) return false
      seen.add(event.eventId)
      if (seen.size > MAX_TRACKED_EVENTS) {
        const oldest = seen.values().next().value
        if (oldest !== undefined) seen.delete(oldest)
      }
      const key = `${event.resource.type}:${event.resource.id}`
      const current = versions.get(key)
      if (current !== undefined && event.version <= current) return false
      versions.set(key, event.version)
      return true
    },
    reset() {
      seen.clear()
      versions.clear()
    },
  }
}

export type EventGuard = ReturnType<typeof createEventGuard>
