/**
 * Dashboard domain types.
 *
 * Aggregated stats and summaries for the main dashboard view.
 */

import type { Document } from '@/features/documents/types'

/** Portfolio-wide summary statistics. */
export interface DashboardStats {
  /** Total number of properties. */
  properties: number
  /** Total number of units across all properties. */
  units: number
  /** Occupancy rate as a percentage (0-100). */
  occupancy: number
  /** Total monthly income from occupied units. */
  monthlyIncome: number
}

/** Financial summary for current month. */
export interface FinancialSummary {
  /** Total revenue for the period. */
  revenue: number
  /** Total expenses for the period. */
  expenses: number
  /** Net profit (revenue - expenses). */
  profit: number
  /** Period label, e.g., "April 2026". */
  period: string
}

/** Work order task item for upcoming tasks widget. */
export interface UpcomingTask {
  id: string
  title: string
  dueDate: string
  status: string
  assignedTo?: string
  propertyAddress?: string
}

/** Dashboard API response shape. */
export interface DashboardData {
  stats: DashboardStats
  recentDocuments: Document[]
  upcomingTasks: UpcomingTask[]
  financials: FinancialSummary
}
