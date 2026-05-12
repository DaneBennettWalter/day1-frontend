/**
 * Status pill for payments.
 *
 * Colors map to semantic state, not a brand palette — so they stay
 * legible across light/dark mode and meet WCAG AA contrast against
 * the `card` background.
 */

import { cn } from '@/lib/utils'
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from '../types'

const STATUS_CLASSES: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  processing: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
  completed:
    'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  failed: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200',
  refunded: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200',
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Payment ${PAYMENT_STATUS_LABELS[status]}`}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_CLASSES[status],
        className
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  )
}
