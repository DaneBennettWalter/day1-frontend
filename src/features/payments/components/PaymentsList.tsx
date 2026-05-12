/**
 * Payments history list.
 *
 * Renders a table-style list of all payments. Each row links to a
 * detail view with the receipt link (if any). Loading uses skeleton
 * rows, errors get a retry, empty state guides to the new-payment
 * action.
 */

import { Link } from 'react-router-dom'
import { ExternalLink, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePaymentsList } from '../hooks'
import { formatAmount } from '../format'
import { PaymentStatusBadge } from './PaymentStatusBadge'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PaymentsList() {
  const { data, isLoading, isError, error, refetch } = usePaymentsList()

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading payments">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm"
      >
        <p className="text-destructive">
          Could not load payments: {error?.message ?? 'unknown error'}
        </p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <RefreshCcw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </Button>
      </div>
    )
  }

  const payments = data?.payments ?? []

  if (payments.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-sm font-medium">No payments yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Once you take a payment it will appear here.
        </p>
      </div>
    )
  }

  return (
    <div
      role="table"
      aria-label="Payment history"
      className="overflow-hidden rounded-md border"
    >
      <div
        role="row"
        className="grid grid-cols-[1fr_120px_140px_120px_40px] gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        <span role="columnheader">Description</span>
        <span role="columnheader" className="text-right">
          Amount
        </span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Date</span>
        <span role="columnheader" className="sr-only">
          Receipt
        </span>
      </div>
      {payments.map((p) => (
        <div
          key={p.id}
          role="row"
          className="grid grid-cols-[1fr_120px_140px_120px_40px] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0 hover:bg-muted/30"
        >
          <div role="cell" className="min-w-0">
            <Link
              to={`/payments/${p.id}`}
              className="block truncate font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {p.description ||
                p.invoiceNumber ||
                `Payment ${p.id.slice(0, 8)}`}
            </Link>
            {p.invoiceNumber ? (
              <p className="truncate text-xs text-muted-foreground">
                Invoice {p.invoiceNumber}
              </p>
            ) : null}
          </div>
          <div role="cell" className="text-right tabular-nums">
            {formatAmount(p.amount, p.currency)}
          </div>
          <div role="cell">
            <PaymentStatusBadge status={p.status} />
          </div>
          <div role="cell" className="text-muted-foreground">
            {formatDate(p.createdAt)}
          </div>
          <div role="cell" className="text-right">
            {p.receiptUrl ? (
              <a
                href={p.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open receipt for ${p.description || p.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
