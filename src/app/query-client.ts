import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/lib/api-error'

const MAX_QUERY_RETRIES = 2

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        failureCount < MAX_QUERY_RETRIES && isApiError(error) && error.isTransient,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
    },
    mutations: {
      retry: false,
    },
  },
})
