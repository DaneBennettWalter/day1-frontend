import { z } from 'zod'
import { CONTACT_TYPES } from './types'

/**
 * Contact validation schemas.
 */

const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zip: z.string().trim().optional(),
  })
  .optional()

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z
    .string()
    .trim()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  type: z.enum(CONTACT_TYPES),
  company: z.string().trim().optional().or(z.literal('')),
  address: addressSchema,
  notes: z.string().trim().optional().or(z.literal('')),
})

export type ContactFormData = z.infer<typeof contactInputSchema>

/** Transform empty strings to undefined for cleaner API payloads. */
export function normalizeContactInput(
  data: ContactFormData
): z.infer<typeof contactInputSchema> {
  return {
    ...data,
    email: data.email?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    company: data.company?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
  }
}
