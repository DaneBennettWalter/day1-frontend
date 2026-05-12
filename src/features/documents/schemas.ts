/**
 * Document form validation.
 *
 * Zod schemas mirror the runtime types; the editor uses
 * `documentInputSchema` via `@hookform/resolvers/zod`.
 *
 * Coercion philosophy: form inputs are strings; numeric coercion happens
 * at the schema boundary so the rest of the codebase deals in numbers.
 */

import { z } from 'zod'
import {
  DOCUMENT_STATUSES,
  type DocumentStatus,
  type DocumentType,
} from './types'

const TYPES: readonly DocumentType[] = [
  'bid',
  'invoice',
  'estimate',
  'work_order',
  'proposal',
  'lease',
  'contract',
  'receipt',
  'purchase_order',
  'change_order',
]

export const documentTypeSchema = z.enum(TYPES as [DocumentType, ...DocumentType[]])

export const documentStatusSchema = z.enum(
  DOCUMENT_STATUSES as unknown as [DocumentStatus, ...DocumentStatus[]]
)

const nonNegativeNumber = z.coerce
  .number({ message: 'Must be a number' })
  .min(0, 'Must be ≥ 0')
  .finite()

export const lineItemSchema = z.object({
  id: z.string().min(1),
  description: z
    .string()
    .trim()
    .min(1, 'Description required')
    .max(500, 'Too long'),
  kind: z.enum(['material', 'labor']),
  quantity: nonNegativeNumber,
  unitPrice: nonNegativeNumber,
  taxable: z.boolean(),
})

export const customerSchema = z.object({
  name: z.string().trim().min(1, 'Name required').max(200),
  email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
})

export const documentInputSchema = z.object({
  type: documentTypeSchema,
  status: documentStatusSchema,
  number: z.string().trim().max(64).optional().or(z.literal('')),
  title: z.string().trim().min(1, 'Title required').max(200),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  customer: customerSchema.optional(),
  propertyId: z.string().trim().max(64).optional().or(z.literal('')),
  propertyAddress: z.string().trim().max(500).optional().or(z.literal('')),
  dueDate: z.string().trim().max(40).optional().or(z.literal('')),
  paymentTerms: z.string().trim().max(120).optional().or(z.literal('')),
  assignedTo: z.string().trim().max(120).optional().or(z.literal('')),
  tasks: z.array(z.string().trim().max(500)).optional(),
  lineItems: z.array(lineItemSchema),
  taxRate: nonNegativeNumber.max(1, 'Use decimal (e.g. 0.0825)'),
  overheadRate: nonNegativeNumber.max(1, 'Use decimal (e.g. 0.10)'),
})

export type DocumentInputForm = z.input<typeof documentInputSchema>
export type DocumentInputParsed = z.output<typeof documentInputSchema>
