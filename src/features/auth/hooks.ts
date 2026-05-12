import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/query'
import { authApi } from './api'
import { useAuthStore } from './store'
import type { LoginInput, RegisterInput } from './types'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  return { user, status, isAuthenticated: status === 'authenticated' && !!user }
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data) => {
      setSession({ user: data.user, accessToken: data.accessToken })
    },
  })
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (data) => {
      setSession({ user: data.user, accessToken: data.accessToken })
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const clearSession = useAuthStore((s) => s.clearSession)

  return useCallback(async () => {
    // Best-effort. Don't block on backend.
    try {
      await authApi.logout()
    } catch {
      /* ignore */
    }
    clearSession()
    queryClient.clear()
    navigate('/login', { replace: true })
  }, [clearSession, navigate])
}
