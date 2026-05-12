/**
 * Centralized endpoint string constants.
 * One source of truth: rename here, ripple everywhere via TS.
 */
export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    refresh: '/api/auth/refresh',
  },
} as const
