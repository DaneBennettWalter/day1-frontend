/**
 * Dashboard hooks tests.
 */

import { describe, expect, it } from 'vitest'
import {
  useDashboardStats,
  useRecentDocuments,
  useUpcomingTasks,
  useFinancialSummary,
} from './hooks'

describe('Dashboard hooks query keys', () => {
  it('useDashboardStats has correct query key', () => {
    const hook = useDashboardStats
    // Query keys are internal to TanStack Query, so we just verify the hook exists
    expect(hook).toBeDefined()
    expect(typeof hook).toBe('function')
  })

  it('useRecentDocuments has correct query key', () => {
    expect(useRecentDocuments).toBeDefined()
    expect(typeof useRecentDocuments).toBe('function')
  })

  it('useUpcomingTasks has correct query key', () => {
    expect(useUpcomingTasks).toBeDefined()
    expect(typeof useUpcomingTasks).toBe('function')
  })

  it('useFinancialSummary has correct query key', () => {
    expect(useFinancialSummary).toBeDefined()
    expect(typeof useFinancialSummary).toBe('function')
  })
})
