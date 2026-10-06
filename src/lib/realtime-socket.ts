import { io, type Socket } from 'socket.io-client'
import { setRealtimeStatus } from '@/lib/realtime'
import { sessionStore } from '@/lib/session-store'

export function createRealtimeSocket(): Socket {
  const socket = io(window.location.origin, {
    path: '/socket.io',
    transports: ['websocket'],
    autoConnect: false,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: (callback) => {
      callback({ token: sessionStore.get().token })
    },
  })

  socket.on('connect', () => {
    setRealtimeStatus('connected')
  })
  socket.on('disconnect', () => {
    setRealtimeStatus('reconnecting')
  })
  socket.io.on('reconnect_attempt', () => {
    setRealtimeStatus('reconnecting')
  })
  socket.io.on('reconnect_failed', () => {
    setRealtimeStatus('offline')
  })

  return socket
}
