/**
 * Dashboard Page
 *
 * Main dashboard with 5 essential widgets in a responsive 2-column grid.
 */

import { useAuth } from '@/features/auth/hooks'
import {
  PortfolioStats,
  RecentDocuments,
  UpcomingTasks,
  FinancialSummary,
  QuickActions,
} from './widgets'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back{user ? `, ${user.displayName}` : ''}.
        </p>
      </div>

      {/* Widget Grid - 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PortfolioStats />
          <FinancialSummary />
          <QuickActions />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RecentDocuments />
          <UpcomingTasks />
        </div>
      </div>
    </div>
  )
}
