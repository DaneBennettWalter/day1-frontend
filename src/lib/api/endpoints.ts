/**
 * Centralized endpoint string constants.
 * One source of truth: rename here, ripple everywhere via TS.
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  settings: {
    get: '/org/default/settings',
    update: '/org/default/settings',
    health: '/health',
    apiKey: '/settings/api-keys',
  },
  ai: {
    chat: '/ai/chat',
    generate: '/ai/generate',
    search: '/ai/search',
  },
  documents: {
    list: '/documents',
    create: '/documents',
    get: (id: string) => `/documents/${id}`,
    update: (id: string) => `/documents/${id}`,
    delete: (id: string) => `/documents/${id}`,
  },
  dashboard: {
    stats: '/dashboard/stats',
    financials: '/dashboard/financials',
  },
  payments: {
    list: '/payments',
    get: (id: string) => `/payments/${id}`,
    createIntent: '/payments/create-intent',
    confirm: '/payments/confirm',
  },
} as const
