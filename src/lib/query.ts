import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry client errors except network.
        if (error instanceof ApiError) {
          if (error.isNetworkError()) return failureCount < 2
          if (error.status >= 400 && error.status < 500) return false
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
