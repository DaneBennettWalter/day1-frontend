import { cn } from '@/lib/utils'
import {
  CONTACT_TYPE_COLORS,
  CONTACT_TYPE_LABELS,
  type ContactType,
} from '../types'

interface ContactBadgeProps {
  type: ContactType
  className?: string
}

export function ContactBadge({ type, className }: ContactBadgeProps) {
  const colors = CONTACT_TYPE_COLORS[type]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colors.bg,
        colors.text,
        className
      )}
    >
      {CONTACT_TYPE_LABELS[type]}
    </span>
  )
}
