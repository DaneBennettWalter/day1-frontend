import { request } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { AuthResponse, LoginInput, RegisterInput, User } from './types'

export const authApi = {
  login(input: LoginInput): Promise<AuthResponse> {
    return request<AuthResponse>(endpoints.auth.login, {
      method: 'POST',
      body: input,
      auth: false,
    })
  },

  register(input: RegisterInput): Promise<AuthResponse> {
    return request<AuthResponse>(endpoints.auth.register, {
      method: 'POST',
      body: {
        email: input.email,
        password: input.password,
        displayName: input.name,
      },
      auth: false,
    })
  },

  logout(): Promise<void> {
    return request<void>(endpoints.auth.logout, {
      method: 'POST',
    })
  },

  me(): Promise<User> {
    return request<User>(endpoints.auth.me, { method: 'GET' })
  },

  /**
   * Refresh uses the HttpOnly cookie. Called with auth:false to avoid
   * the 401→refresh→retry loop in the api client.
   */
  refresh(): Promise<AuthResponse> {
    return request<AuthResponse>(endpoints.auth.refresh, {
      method: 'POST',
      auth: false,
    })
  },
}
