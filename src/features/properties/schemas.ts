import { z } from 'zod'

/**
 * Zod schemas for property and unit forms.
 */

export const propertyAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter code'),
  zip: z.string().min(5, 'ZIP code is required'),
})

export const propertyInputSchema = z.object({
  address: propertyAddressSchema,
  type: z.enum(['residential', 'commercial', 'mixed-use'] as const),
  ownerId: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  currentValue: z.number().optional(),
  notes: z.string().optional(),
})

export const unitInputSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().optional(),
  squareFeet: z.number().int().optional(),
  rentAmount: z.number().optional(),
  tenantId: z.string().optional(),
  leaseStart: z.string().optional(),
  leaseEnd: z.string().optional(),
  status: z.enum(['vacant', 'occupied', 'maintenance'] as const),
  notes: z.string().optional(),
})

export type PropertyFormData = z.infer<typeof propertyInputSchema>
export type UnitFormData = z.infer<typeof unitInputSchema>
