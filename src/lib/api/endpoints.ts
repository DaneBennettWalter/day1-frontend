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
  documents: {
    list: '/api/documents',
    create: '/api/documents',
    get: (id: string) => `/api/documents/${id}`,
    update: (id: string) => `/api/documents/${id}`,
    delete: (id: string) => `/api/documents/${id}`,
  },
  dashboard: {
    stats: '/api/dashboard/stats',
    financials: '/api/dashboard/financials',
  },
  payments: {
    list: '/api/payments',
    get: (id: string) => `/api/payments/${id}`,
    createIntent: '/api/payments/create-intent',
    confirm: '/api/payments/confirm',
  },
} as const
