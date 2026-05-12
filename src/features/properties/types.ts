/**
 * Properties domain types.
 *
 * Multi-unit property management with rent roll and occupancy tracking.
 */

export type PropertyType = 'residential' | 'commercial' | 'mixed-use'

export const PROPERTY_TYPES: readonly PropertyType[] = [
  'residential',
  'commercial',
  'mixed-use',
] as const

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  'mixed-use': 'Mixed-Use',
}

export type UnitStatus = 'vacant' | 'occupied' | 'maintenance'

export const UNIT_STATUSES: readonly UnitStatus[] = [
  'vacant',
  'occupied',
  'maintenance',
] as const

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  vacant: 'Vacant',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
}

export const UNIT_STATUS_COLORS: Record<
  UnitStatus,
  { bg: string; text: string }
> = {
  vacant: {
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-400',
  },
  occupied: {
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-400',
  },
  maintenance: {
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
}

/** Server-side address shape. */
export interface PropertyAddress {
  street: string
  city: string
  state: string
  zip: string
}

/** Full property record. */
export interface Property {
  id: string
  address: PropertyAddress
  type: PropertyType
  ownerId?: string
  ownerName?: string
  purchaseDate?: string
  purchasePrice?: number
  currentValue?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

/** Creation/update payload for properties. */
export interface PropertyInput {
  address: PropertyAddress
  type: PropertyType
  ownerId?: string
  purchaseDate?: string
  purchasePrice?: number
  currentValue?: number
  notes?: string
}

/** Full unit record. */
export interface Unit {
  id: string
  propertyId: string
  unitNumber: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  rentAmount?: number
  tenantId?: string
  tenantName?: string
  leaseStart?: string
  leaseEnd?: string
  status: UnitStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

/** Creation/update payload for units. */
export interface UnitInput {
  unitNumber: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  rentAmount?: number
  tenantId?: string
  leaseStart?: string
  leaseEnd?: string
  status: UnitStatus
  notes?: string
}

/** Query filters for GET /api/properties. */
export interface PropertyFilters {
  q?: string
  type?: PropertyType
  sortBy?: 'address' | 'type' | 'purchaseDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

/** Property with computed stats. */
export interface PropertyWithStats extends Property {
  unitCount: number
  occupiedCount: number
  occupancyRate: number
  monthlyIncome: number
}

/** Rent roll item — unit with property context. */
export interface RentRollItem {
  unitId: string
  unitNumber: string
  propertyId: string
  propertyAddress: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  rentAmount?: number
  tenantId?: string
  tenantName?: string
  leaseStart?: string
  leaseEnd?: string
  status: UnitStatus
}

/** Portfolio-wide summary stats. */
export interface PortfolioStats {
  totalProperties: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  maintenanceUnits: number
  occupancyRate: number
  totalMonthlyIncome: number
}
