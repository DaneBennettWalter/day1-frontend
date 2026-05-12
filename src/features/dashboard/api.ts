/**
 * Dashboard API client.
 *
 * Aggregated endpoints for portfolio stats, recent activity, and summaries.
 */

import { request } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { Document, ListDocumentsParams } from '@/features/documents/types'
import type { DashboardStats, FinancialSummary, UpcomingTask } from './types'

/**
 * Fetch portfolio-wide statistics.
 * Aggregates properties, units, occupancy rate, and monthly income.
 */
export async function getDashboardStats(
  signal?: AbortSignal
): Promise<DashboardStats> {
  return request<DashboardStats>(endpoints.dashboard.stats, {
    method: 'GET',
    signal,
  })
}

/**
 * Fetch recent documents (default: 10 most recently updated).
 */
export async function getRecentDocuments(
  params: ListDocumentsParams & { limit?: number; sort?: string } = {},
  signal?: AbortSignal
): Promise<{ documents: Document[]; total: number }> {
  const usp = new URLSearchParams()
  if (params.limit) usp.set('limit', String(params.limit))
  if (params.sort) usp.set('sort', params.sort)
  if (params.type) usp.set('type', params.type)
  if (params.status) usp.set('status', params.status)

  const query = usp.toString()
  const path = query
    ? `${endpoints.documents.list}?${query}`
    : endpoints.documents.list

  return request<{ documents: Document[]; total: number }>(path, {
    method: 'GET',
    signal,
  })
}

/**
 * Fetch upcoming tasks (work orders due soon).
 * Filters documents of type work_order with pending status, sorted by dueDate.
 */
export async function getUpcomingTasks(
  signal?: AbortSignal
): Promise<UpcomingTask[]> {
  const params = new URLSearchParams({
    type: 'work_order',
    status: 'draft', // or 'sent' — tasks not yet completed
  })

  const response = await request<{ documents: Document[]; total: number }>(
    `${endpoints.documents.list}?${params.toString()}`,
    { method: 'GET', signal }
  )

  // Map documents to UpcomingTask shape
  return response.documents
    .filter((doc) => doc.dueDate) // only include docs with due dates
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      dueDate: doc.dueDate!,
      status: doc.status,
      assignedTo: doc.assignedTo,
      propertyAddress: doc.propertyAddress,
    }))
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 10) // Top 10 upcoming
}

/**
 * Fetch financial summary for the current month.
 */
export async function getFinancialSummary(
  signal?: AbortSignal
): Promise<FinancialSummary> {
  return request<FinancialSummary>(endpoints.dashboard.financials, {
    method: 'GET',
    signal,
  })
}

export const dashboardApi = {
  getStats: getDashboardStats,
  getRecentDocuments,
  getUpcomingTasks,
  getFinancialSummary,
}
