import { create } from 'zustand'
import { authApi } from './api'
import type { AuthStatus, Session, User } from './types'

interface AuthState {
  user: User | null
  accessToken: string | null
  status: AuthStatus
  /** Single-flight promise. While set, all callers share this refresh. */
  refreshPromise: Promise<boolean> | null

  setSession: (session: Session) => void
  clearSession: () => void
  setStatus: (status: AuthStatus) => void

  /** Single-flight refresh. Returns true on success, false on failure. */
  refresh: () => Promise<boolean>

  /** Hydrate on app boot. Tries refresh; resolves status. */
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  status: 'idle',
  refreshPromise: null,

  setSession: (session) =>
    set({
      user: session.user,
      accessToken: session.accessToken,
      status: 'authenticated',
    }),

  clearSession: () =>
    set({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
      refreshPromise: null,
    }),

  setStatus: (status) => set({ status }),

  refresh: () => {
    const existing = get().refreshPromise
    if (existing) return existing

    const promise = (async () => {
      try {
        const result = await authApi.refresh()
        set({
          user: result.user,
          accessToken: result.accessToken,
          status: 'authenticated',
        })
        return true
      } catch {
        set({
          user: null,
          accessToken: null,
          status: 'unauthenticated',
        })
        return false
      } finally {
        set({ refreshPromise: null })
      }
    })()

    set({ refreshPromise: promise })
    return promise
  },

  hydrate: async () => {
    set({ status: 'loading' })
    await get().refresh()
  },
}))
