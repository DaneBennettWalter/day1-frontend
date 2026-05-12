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
  settings: {
    get: '/api/org/default/settings',
    update: '/api/org/default/settings',
    health: '/api/health',
    apiKey: '/api/settings/api-keys',
  },
  ai: {
    chat: '/api/ai/chat',
    generate: '/api/ai/generate',
    search: '/api/ai/search',
  },
} as const
