import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { queryClient } from '@/app/query-client'
import { RealtimeSync } from '@/app/realtime-sync'
import { router } from '@/app/router'
import { SessionSync } from '@/app/session-sync'
import { Toaster } from '@/components/ui/sonner'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionSync />
      <RealtimeSync />
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  )
}
