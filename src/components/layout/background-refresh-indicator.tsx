import { useIsFetching } from '@tanstack/react-query'
import { RefreshCwIcon } from 'lucide-react'

export function BackgroundRefreshIndicator() {
  const refreshing = useIsFetching({ predicate: (query) => query.state.status === 'success' })

  return (
    <div role="status" className="pointer-events-none fixed right-4 bottom-24 z-40 lg:bottom-6">
      {refreshing > 0 && (
        <span className="flex items-center gap-2 rounded-pill border border-border bg-surface-card px-3 py-1.5 text-caption-sm text-text-secondary shadow-card">
          <RefreshCwIcon className="size-3.5 motion-safe:animate-spin" aria-hidden />
          Atualizando…
        </span>
      )}
    </div>
  )
}
