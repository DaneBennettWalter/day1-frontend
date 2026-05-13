import { request } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { AuthResponse, LoginInput, RegisterInput, User } from './types'

// Backend returns { token, user } but we expect { accessToken, user }
function normalizeAuthResponse(res: {
  token: string
  user: User
}): AuthResponse {
  return {
    accessToken: res.token,
    user: res.user,
  }
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const res = await request<{ token: string; user: User }>(
      endpoints.auth.login,
      {
        method: 'POST',
        body: input,
        auth: false,
      }
    )
    return normalizeAuthResponse(res)
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const res = await request<{ token: string; user: User }>(
      endpoints.auth.register,
      {
        method: 'POST',
        body: {
          email: input.email,
          password: input.password,
          displayName: input.name,
        },
        auth: false,
      }
    )
    return normalizeAuthResponse(res)
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
  async refresh(): Promise<AuthResponse> {
    const res = await request<{ token: string; user: User }>(
      endpoints.auth.refresh,
      {
        method: 'POST',
        auth: false,
      }
    )
    return normalizeAuthResponse(res)
  },
}
