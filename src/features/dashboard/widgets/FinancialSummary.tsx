/**
 * Financial Summary Widget
 *
 * Displays monthly revenue, expenses, and profit with stat cards.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinancialSummary } from '../hooks'

function StatCard({
  label,
  value,
  variant = 'default',
  loading,
}: {
  label: string
  value: string
  variant?: 'default' | 'positive' | 'negative'
  loading?: boolean
}) {
  const colorClass = {
    default: 'text-foreground',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
  }[variant]

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p className={`text-xl font-semibold ${colorClass}`}>{value}</p>
      )}
    </div>
  )
}

export default function FinancialSummary() {
  const { data, isLoading, isError, error, refetch } = useFinancialSummary()

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              {error instanceof Error
                ? error.message
                : 'Failed to load financial data'}
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

  const summary = data || {
    revenue: 0,
    expenses: 0,
    profit: 0,
    period: new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
  }

  const profitVariant = summary.profit >= 0 ? 'positive' : 'negative'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
        <p className="text-sm text-muted-foreground">{summary.period}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Revenue"
            value={formatter.format(summary.revenue)}
            loading={isLoading}
          />
          <StatCard
            label="Expenses"
            value={formatter.format(summary.expenses)}
            loading={isLoading}
          />
          <StatCard
            label="Profit"
            value={formatter.format(summary.profit)}
            variant={profitVariant}
            loading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  )
}
