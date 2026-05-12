import { Badge } from '@/components/ui/badge'
import type { PropertyType } from '../types'
import { PROPERTY_TYPE_LABELS } from '../types'

interface PropertyBadgeProps {
  type: PropertyType
}

const TYPE_COLORS: Record<
  PropertyType,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  residential: 'default',
  commercial: 'secondary',
  'mixed-use': 'outline',
}

export function PropertyBadge({ type }: PropertyBadgeProps) {
  return <Badge variant={TYPE_COLORS[type]}>{PROPERTY_TYPE_LABELS[type]}</Badge>
}
