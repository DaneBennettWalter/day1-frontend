/**
 * Contacts domain types.
 *
 * Unified contact management for customers, vendors, contractors,
 * employees, tenants, owners, and misc.
 */

export type ContactType =
  | 'customer'
  | 'vendor'
  | 'contractor'
  | 'employee'
  | 'tenant'
  | 'owner'
  | 'other'

export const CONTACT_TYPES: readonly ContactType[] = [
  'customer',
  'vendor',
  'contractor',
  'employee',
  'tenant',
  'owner',
  'other',
] as const

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  customer: 'Customer',
  vendor: 'Vendor',
  contractor: 'Contractor',
  employee: 'Employee',
  tenant: 'Tenant',
  owner: 'Owner',
  other: 'Other',
}

export const CONTACT_TYPE_COLORS: Record<
  ContactType,
  { bg: string; text: string }
> = {
  customer: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-400',
  },
  vendor: {
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-400',
  },
  contractor: {
    bg: 'bg-purple-100 dark:bg-purple-950',
    text: 'text-purple-700 dark:text-purple-400',
  },
  employee: {
    bg: 'bg-orange-100 dark:bg-orange-950',
    text: 'text-orange-700 dark:text-orange-400',
  },
  tenant: {
    bg: 'bg-pink-100 dark:bg-pink-950',
    text: 'text-pink-700 dark:text-pink-400',
  },
  owner: {
    bg: 'bg-indigo-100 dark:bg-indigo-950',
    text: 'text-indigo-700 dark:text-indigo-400',
  },
  other: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
  },
}

/** Server-side address shape. */
export interface ContactAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
}

/** Full contact record (from GET /api/contacts/:id or list). */
export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  type: ContactType
  company?: string
  address?: ContactAddress
  notes?: string
  createdAt: string
  updatedAt: string
}

/** Creation/update payload. */
export interface ContactInput {
  name: string
  email?: string
  phone?: string
  type: ContactType
  company?: string
  address?: ContactAddress
  notes?: string
}

/** Query filters for GET /api/contacts. */
export interface ContactFilters {
  q?: string
  type?: ContactType
  sortBy?: 'name' | 'type' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}
