/**
 * Dashboard TanStack Query hooks.
 *
 * Stale time: 5 minutes (dashboards don't need real-time updates).
 * Background refetch on window focus.
 */

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from './api'

const STALE_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch portfolio-wide statistics.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: ({ signal }) => dashboardApi.getStats(signal),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: true,
  })
}

/**
 * Fetch recent documents (10 most recently updated).
 */
export function useRecentDocuments() {
  return useQuery({
    queryKey: ['dashboard', 'recent-documents'],
    queryFn: ({ signal }) =>
      dashboardApi.getRecentDocuments(
        { limit: 10, sort: 'updatedAt:desc' },
        signal
      ),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: true,
  })
}

/**
 * Fetch upcoming tasks (work orders due soon).
 */
export function useUpcomingTasks() {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-tasks'],
    queryFn: ({ signal }) => dashboardApi.getUpcomingTasks(signal),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: true,
  })
}

/**
 * Fetch financial summary for the current month.
 */
export function useFinancialSummary() {
  return useQuery({
    queryKey: ['dashboard', 'financials'],
    queryFn: ({ signal }) => dashboardApi.getFinancialSummary(signal),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: true,
  })
}
