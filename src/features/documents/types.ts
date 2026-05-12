/**
 * Documents domain types.
 *
 * Ten document types per the legacy app analysis; P4 ships five
 * (bid, invoice, estimate, work_order, proposal) but the schema is
 * forward-compat for the remaining five.
 */

export type DocumentType =
  | 'bid'
  | 'invoice'
  | 'estimate'
  | 'work_order'
  | 'proposal'
  | 'lease'
  | 'contract'
  | 'receipt'
  | 'purchase_order'
  | 'change_order'

/** Subset shipped in P4 — drives UI surfaces (type picker, kanban filters). */
export const SHIPPED_TYPES = [
  'bid',
  'invoice',
  'estimate',
  'work_order',
  'proposal',
] as const satisfies readonly DocumentType[]

export type ShippedDocumentType = (typeof SHIPPED_TYPES)[number]

export type DocumentStatus = 'draft' | 'sent' | 'approved' | 'rejected'

export const DOCUMENT_STATUSES: readonly DocumentStatus[] = [
  'draft',
  'sent',
  'approved',
  'rejected',
] as const

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  bid: 'Bid',
  invoice: 'Invoice',
  estimate: 'Estimate',
  work_order: 'Work Order',
  proposal: 'Proposal',
  lease: 'Lease',
  contract: 'Contract',
  receipt: 'Receipt',
  purchase_order: 'Purchase Order',
  change_order: 'Change Order',
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  approved: 'Approved',
  rejected: 'Rejected',
}

export type LineItemKind = 'material' | 'labor'

export interface LineItem {
  id: string
  description: string
  kind: LineItemKind
  quantity: number
  unitPrice: number
  /** Whether tax applies to this line. */
  taxable: boolean
}

/**
 * Document-level totals. Computed; never stored as source of truth — derive
 * from `lineItems`, `taxRate`, `overheadRate`. We carry totals on the
 * `Document` itself for list views and server-side reporting, but the editor
 * always recomputes on save.
 */
export interface DocumentTotals {
  subtotal: number
  taxableSubtotal: number
  tax: number
  overhead: number
  total: number
}

export interface Document {
  id: string
  type: DocumentType
  status: DocumentStatus
  /** Human-facing reference, e.g. "BID-001". */
  number?: string
  title: string
  /** Free-form scope-of-work or notes; renders in Proposal/Bid bodies. */
  description?: string
  customer?: {
    name: string
    email?: string
    phone?: string
    address?: string
  }
  propertyId?: string
  propertyAddress?: string
  /** Invoice-only fields. */
  dueDate?: string
  paymentTerms?: string
  /** Work-order-only fields. */
  assignedTo?: string
  tasks?: string[]
  lineItems: LineItem[]
  /** Decimal rate, e.g. 0.0825 for 8.25%. */
  taxRate: number
  /** Decimal rate, e.g. 0.10 for 10%. */
  overheadRate: number
  totals: DocumentTotals
  createdAt: string
  updatedAt: string
}

export interface ListDocumentsParams {
  type?: DocumentType
  status?: DocumentStatus
  /** ISO date strings, inclusive. */
  from?: string
  to?: string
  q?: string
}

export interface ListDocumentsResponse {
  documents: Document[]
  total: number
}

/** Editor-facing input — totals are recomputed by the calc engine. */
export type DocumentInput = Omit<
  Document,
  'id' | 'createdAt' | 'updatedAt' | 'totals'
>

export interface AiGenerateDocumentInput {
  description: string
  type: ShippedDocumentType
}

export interface AiGenerateDocumentResult {
  /** Partial document the editor merges over its defaults. */
  document: Partial<DocumentInput>
}
