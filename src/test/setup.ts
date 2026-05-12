import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Set required env vars before any module-level reads.
Object.assign(import.meta.env, {
  VITE_API_BASE_URL: 'http://localhost:8000',
  VITE_ENV: 'development',
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
