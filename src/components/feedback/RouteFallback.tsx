/**
 * Suspense fallback for code-split routes.
 *
 * Intentionally tiny: shows a centered skeleton block. Most route
 * chunks load in <100ms on a warm cache; a heavy spinner would
 * flash and feel worse than nothing.
 */

import { Skeleton } from '@/components/ui/skeleton'

export function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="space-y-4 p-6"
    >
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
