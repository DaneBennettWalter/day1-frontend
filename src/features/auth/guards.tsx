import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { FullPageSpinner } from '@/components/feedback/FullPageSpinner'
import { useAuthStore } from './store'

/**
 * Gate authed routes. Shows a spinner during initial hydration so we
 * don't flash unauthenticated UI to users with a valid refresh cookie.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === 'idle' || status === 'loading') return <FullPageSpinner />

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return <>{children}</>
}

/**
 * Inverse guard: keep authenticated users out of /login and /register.
 */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)

  if (status === 'idle' || status === 'loading') return <FullPageSpinner />

  if (user) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
