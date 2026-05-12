/**
 * Payments domain types.
 *
 * Backend contract derived from the implementation plan:
 *   POST /api/payments/create-intent  → returns clientSecret + paymentId
 *   POST /api/payments/confirm        → finalizes a payment
 *   GET  /api/payments                → list
 *   GET  /api/payments/:id            → detail
 *
 * We never touch raw card data here; that stays inside Stripe Elements.
 * The client only handles intent → confirmation lifecycle metadata.
 */

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
] as const

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
}

/**
 * Amounts are stored as integer minor units (cents) end-to-end —
 * Stripe's convention. We only format to dollars at the UI edge.
 */
export interface Payment {
  id: string
  amount: number // cents
  currency: string // ISO 4217, lowercase per Stripe ("usd")
  status: PaymentStatus
  description: string | null
  documentId: string | null
  invoiceNumber: string | null
  receiptUrl: string | null
  /** Stripe payment intent ID, for support / reconciliation. */
  stripePaymentIntentId: string | null
  createdAt: string
  completedAt: string | null
}

export interface ListPaymentsParams {
  status?: PaymentStatus
  documentId?: string
  /** ISO date, inclusive. */
  from?: string
  /** ISO date, inclusive. */
  to?: string
}

export interface ListPaymentsResponse {
  payments: Payment[]
  total: number
}

export interface CreatePaymentIntentInput {
  amount: number // cents
  currency?: string // defaults to 'usd' server-side
  description?: string
  documentId?: string
}

export interface CreatePaymentIntentResponse {
  paymentId: string
  clientSecret: string
}

export interface ConfirmPaymentInput {
  paymentId: string
  stripePaymentIntentId: string
}
