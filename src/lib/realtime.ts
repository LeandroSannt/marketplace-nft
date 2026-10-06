import { useSyncExternalStore } from 'react'

export type RealtimeStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline'

let status: RealtimeStatus = 'connecting'
const listeners = new Set<() => void>()

export function setRealtimeStatus(next: RealtimeStatus) {
  if (status === next) return
  status = next
  for (const listener of listeners) listener()
}

export const realtimeStatusStore = {
  get: () => status,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export function useRealtimeStatus() {
  return useSyncExternalStore(realtimeStatusStore.subscribe, realtimeStatusStore.get)
}
