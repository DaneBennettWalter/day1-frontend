/**
 * Portfolio Stats Widget
 *
 * Displays 4 key metrics: properties, units, occupancy %, monthly income.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '../hooks'

function StatCard({
  label,
  value,
  loading,
}: {
  label: string
  value: string | number
  loading?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p className="text-2xl font-semibold">{value}</p>
      )}
    </div>
  )
}

export default function PortfolioStats() {
  const { data, isLoading, isError, error, refetch } = useDashboardStats()

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              {error instanceof Error ? error.message : 'Failed to load stats'}
            </p>
            <button
              onClick={() => {
                void refetch()
              }}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = data || {
    properties: 0,
    units: 0,
    occupancy: 0,
    monthlyIncome: 0,
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Properties"
            value={stats.properties}
            loading={isLoading}
          />
          <StatCard label="Units" value={stats.units} loading={isLoading} />
          <StatCard
            label="Occupancy"
            value={`${stats.occupancy.toFixed(1)}%`}
            loading={isLoading}
          />
          <StatCard
            label="Monthly Income"
            value={formatter.format(stats.monthlyIncome)}
            loading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  )
}
