import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

import { configureApiClient } from '@/lib/api/client'
import { queryClient } from '@/lib/query'
import { useAuthStore } from '@/features/auth/store'
import { Toaster } from '@/components/feedback/Toaster'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

// Wire api client → auth store. Done once, at boot, to avoid circular imports.
configureApiClient({
  getToken: () => useAuthStore.getState().accessToken,
  refresh: () => useAuthStore.getState().refresh(),
  onAuthLost: () => useAuthStore.getState().clearSession(),
})

// Hydrate session from refresh cookie before the app paints protected UI.
void useAuthStore.getState().hydrate()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
