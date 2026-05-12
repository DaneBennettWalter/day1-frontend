/**
 * Status badge — colored pill keyed by document status.
 * Shared by the list, the kanban card, and the print header.
 */

import { cn } from '@/lib/utils'
import {
  DOCUMENT_STATUS_LABELS,
  type DocumentStatus,
} from '../types'

const STATUS_CLASS: Record<DocumentStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-300',
}

export function StatusBadge({
  status,
  className,
}: {
  status: DocumentStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        STATUS_CLASS[status],
        className
      )}
    >
      {DOCUMENT_STATUS_LABELS[status]}
    </span>
  )
}
