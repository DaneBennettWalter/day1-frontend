import { Badge } from '@/components/ui/badge'
import type { UnitStatus } from '../types'
import { UNIT_STATUS_LABELS } from '../types'

interface UnitStatusBadgeProps {
  status: UnitStatus
}

const STATUS_VARIANTS: Record<
  UnitStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  vacant: 'destructive',
  occupied: 'default',
  maintenance: 'secondary',
}

export function UnitStatusBadge({ status }: UnitStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {UNIT_STATUS_LABELS[status]}
    </Badge>
  )
}
