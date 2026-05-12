/**
 * Zod validation schemas for settings forms
 */
import { z } from 'zod'

// General/Company tab
export const generalSettingsSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200),
  description: z.string().max(1000).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  ein: z.string().max(20).optional(),
})

// Branding tab
export const brandingSettingsSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #3b82f6)')
    .optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #10b981)')
    .optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
})

// Defaults tab
export const defaultsSettingsSchema = z.object({
  taxRate: z
    .number()
    .min(0, 'Tax rate must be 0 or greater')
    .max(100, 'Tax rate cannot exceed 100')
    .optional(),
  overheadRate: z
    .number()
    .min(0, 'Overhead rate must be 0 or greater')
    .max(100, 'Overhead rate cannot exceed 100')
    .optional(),
  paymentTerms: z
    .number()
    .int('Payment terms must be a whole number')
    .min(0, 'Payment terms must be 0 or greater')
    .optional(),
  defaultInvoiceNotes: z.string().max(2000).optional(),
})

// AI tab
export const aiSettingsSchema = z.object({
  apiKey: z
    .string()
    .min(20, 'API key appears invalid')
    .regex(
      /^sk-ant-/,
      'Must be a valid Anthropic API key (starts with sk-ant-)'
    )
    .optional(),
})

// Export types inferred from schemas
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>
export type BrandingSettingsInput = z.infer<typeof brandingSettingsSchema>
export type DefaultsSettingsInput = z.infer<typeof defaultsSettingsSchema>
export type AiSettingsInput = z.infer<typeof aiSettingsSchema>
