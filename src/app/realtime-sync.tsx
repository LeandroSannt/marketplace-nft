import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import type { Socket } from 'socket.io-client'
import { nftUpdatedEventSchema, orderUpdatedEventSchema, REALTIME_EVENTS } from '@/contracts/events'
import { cartKeys } from '@/features/cart/queries'
import { describeCartImpact } from '@/features/cart/notices'
import { applyNftUpdatedToCart } from '@/features/cart/realtime'
import { catalogKeys } from '@/features/catalog/queries'
import { applyNftUpdated } from '@/features/catalog/realtime'
import { orderKeys, quoteKeys } from '@/features/checkout/queries'
import { applyOrderUpdated } from '@/features/checkout/realtime'
import { createEventGuard } from '@/lib/event-guard'
import { networkReady } from '@/lib/network-ready'
import { useSession } from '@/lib/session-store'

function reconcile(queryClient: QueryClient) {
  for (const queryKey of [catalogKeys.all, cartKeys.all, quoteKeys.all, orderKeys.all]) {
    void queryClient.invalidateQueries({ queryKey })
  }
}

function listen(socket: Socket, queryClient: QueryClient, userId: string | null) {
  const guard = createEventGuard()
  let connectedBefore = false

  socket.on('connect', () => {
    if (connectedBefore) reconcile(queryClient)
    connectedBefore = true
  })

  socket.on(REALTIME_EVENTS.nftUpdated, (payload: unknown) => {
    const event = nftUpdatedEventSchema.safeParse(payload)
    if (!event.success || !guard.accept(event.data)) return
    applyNftUpdated(queryClient, event.data)
    for (const impact of applyNftUpdatedToCart(queryClient, event.data)) {
      toast.info(describeCartImpact(impact))
    }
  })

  socket.on(REALTIME_EVENTS.orderUpdated, (payload: unknown) => {
    const event = orderUpdatedEventSchema.safeParse(payload)
    if (!userId || !event.success || !guard.accept(event.data)) return
    applyOrderUpdated(queryClient, userId, event.data)
  })
}

export function RealtimeSync() {
  const queryClient = useQueryClient()
  const { token, userId } = useSession()

  useEffect(() => {
    let socket: Socket | null = null
    let disposed = false

    void networkReady
      .then(() => import('@/lib/realtime-socket'))
      .then(({ createRealtimeSocket }) => {
        if (disposed) return
        socket = createRealtimeSocket()
        listen(socket, queryClient, userId)
        socket.connect()
      })

    return () => {
      disposed = true
      if (!socket) return
      socket.removeAllListeners()
      socket.io.removeAllListeners()
      socket.disconnect()
    }
  }, [queryClient, token, userId])

  return null
}
