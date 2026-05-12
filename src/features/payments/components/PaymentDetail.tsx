/**
 * Payment detail card — shown on /payments/:id.
 *
 * Mostly read-only: details + receipt + linked document.
 */

import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePayment } from '../hooks'
import { formatAmount } from '../format'
import { PaymentStatusBadge } from './PaymentStatusBadge'

export function PaymentDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: payment, isLoading, isError, error } = usePayment(id)

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/payments"
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to payments
        </Link>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </Card>
      ) : isError || !payment ? (
        <Card>
          <CardContent className="p-6">
            <p role="alert" className="text-sm text-destructive">
              Could not load payment: {error?.message ?? 'not found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {formatAmount(payment.amount, payment.currency)}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {payment.description || 'No description'}
                </p>
              </div>
              <PaymentStatusBadge status={payment.status} />
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(payment.createdAt).toLocaleString()}</dd>
              </div>
              {payment.completedAt ? (
                <div>
                  <dt className="text-muted-foreground">Completed</dt>
                  <dd>{new Date(payment.completedAt).toLocaleString()}</dd>
                </div>
              ) : null}
              {payment.invoiceNumber ? (
                <div>
                  <dt className="text-muted-foreground">Invoice</dt>
                  <dd>{payment.invoiceNumber}</dd>
                </div>
              ) : null}
              {payment.documentId ? (
                <div>
                  <dt className="text-muted-foreground">Document</dt>
                  <dd>
                    <Link
                      to={`/documents/${payment.documentId}/edit`}
                      className="text-primary hover:underline"
                    >
                      View document
                    </Link>
                  </dd>
                </div>
              ) : null}
              {payment.stripePaymentIntentId ? (
                <div className="md:col-span-2">
                  <dt className="text-muted-foreground">
                    Stripe payment intent
                  </dt>
                  <dd className="font-mono text-xs">
                    {payment.stripePaymentIntentId}
                  </dd>
                </div>
              ) : null}
            </dl>

            {payment.receiptUrl ? (
              <div className="mt-6">
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  View receipt
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
