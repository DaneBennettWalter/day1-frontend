export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string | null
  bio?: string | null
  role?: string
  createdAt?: string
}

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'

export interface Session {
  user: User
  accessToken: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}
