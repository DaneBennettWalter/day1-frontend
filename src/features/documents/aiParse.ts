/**
 * Parser for AI-generated document payloads.
 *
 * The `/api/ai/generate` endpoint returns a loosely-typed `Record<string,
 * unknown>` (it's an LLM — shape is whatever it dreamed up). We coerce it
 * into a `Partial<DocumentInput>` the editor can safely merge over its
 * defaults.
 *
 * Defensive throughout: any garbage field is dropped, never thrown over.
 * The user sees their best-effort populated form and can edit before save.
 */

import type {
  DocumentInput,
  DocumentStatus,
  DocumentType,
  LineItem,
  LineItemKind,
} from './types'

const VALID_TYPES = new Set<DocumentType>([
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
])

const VALID_STATUSES = new Set<DocumentStatus>([
  'draft',
  'sent',
  'approved',
  'rejected',
])

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function asString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t.length ? t : undefined
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const cleaned = v.replace(/[$,%\s]/g, '')
    const n = Number(cleaned)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function asRate(v: unknown): number | undefined {
  const n = asNumber(v)
  if (n === undefined) return undefined
  // If model returned a percent (e.g. 8.25), convert to decimal.
  if (n > 1) return n / 100
  if (n < 0) return 0
  return n
}

function asBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const s = v.toLowerCase()
    if (['true', 'yes', 'y', '1'].includes(s)) return true
    if (['false', 'no', 'n', '0'].includes(s)) return false
  }
  return fallback
}

function asKind(v: unknown): LineItemKind {
  if (typeof v === 'string') {
    const s = v.toLowerCase()
    if (s.startsWith('lab')) return 'labor'
    if (s.startsWith('mat')) return 'material'
  }
  return 'material'
}

function parseLineItem(raw: unknown): LineItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const description =
    asString(r.description) ??
    asString(r.name) ??
    asString(r.title) ??
    asString(r.item)
  if (!description) return null

  const quantity = asNumber(r.quantity) ?? asNumber(r.qty) ?? 1
  const unitPrice =
    asNumber(r.unitPrice) ??
    asNumber(r.unit_price) ??
    asNumber(r.price) ??
    asNumber(r.rate) ??
    0

  return {
    id: typeof r.id === 'string' && r.id ? r.id : uuid(),
    description,
    kind: asKind(r.kind ?? r.type ?? r.category),
    quantity: Math.max(0, quantity),
    unitPrice: Math.max(0, unitPrice),
    taxable: asBool(r.taxable, true),
  }
}

function parseTasks(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const out: string[] = []
  for (const t of raw) {
    const s = asString(t)
    if (s) out.push(s)
  }
  return out.length ? out : undefined
}

function parseCustomer(raw: unknown): DocumentInput['customer'] | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Record<string, unknown>
  const name = asString(r.name) ?? asString(r.fullName) ?? asString(r.full_name)
  if (!name) return undefined
  return {
    name,
    email: asString(r.email),
    phone: asString(r.phone) ?? asString(r.phoneNumber),
    address: asString(r.address),
  }
}

/**
 * Parse an LLM `document` payload into editor-shaped input.
 *
 * Robust to:
 *   - Snake_case keys
 *   - Strings where numbers are expected ("$1,200", "10%")
 *   - Percent vs decimal rate ambiguity
 *   - Missing/extra fields
 *
 * Never throws. Worst case returns `{}` and the user fills it in.
 */
export function parseAiDocument(
  raw: unknown,
  fallbackType: DocumentType = 'bid'
): Partial<DocumentInput> {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>

  // The model may nest under `document` or return a flat object.
  const root =
    r.document && typeof r.document === 'object'
      ? (r.document as Record<string, unknown>)
      : r

  const out: Partial<DocumentInput> = {}

  const rawType = asString(root.type)
  if (rawType && VALID_TYPES.has(rawType as DocumentType)) {
    out.type = rawType as DocumentType
  } else if (fallbackType) {
    out.type = fallbackType
  }

  const rawStatus = asString(root.status)
  if (rawStatus && VALID_STATUSES.has(rawStatus as DocumentStatus)) {
    out.status = rawStatus as DocumentStatus
  }

  const title =
    asString(root.title) ?? asString(root.name) ?? asString(root.summary)
  if (title) out.title = title

  const description =
    asString(root.description) ??
    asString(root.scope) ??
    asString(root.notes) ??
    asString(root.body)
  if (description) out.description = description

  const number = asString(root.number) ?? asString(root.reference)
  if (number) out.number = number

  const customer = parseCustomer(root.customer ?? root.client)
  if (customer) out.customer = customer

  const propertyAddress =
    asString(root.propertyAddress) ?? asString(root.property_address)
  if (propertyAddress) out.propertyAddress = propertyAddress

  const dueDate = asString(root.dueDate) ?? asString(root.due_date)
  if (dueDate) out.dueDate = dueDate

  const paymentTerms =
    asString(root.paymentTerms) ?? asString(root.payment_terms) ?? asString(root.terms)
  if (paymentTerms) out.paymentTerms = paymentTerms

  const assignedTo = asString(root.assignedTo) ?? asString(root.assigned_to)
  if (assignedTo) out.assignedTo = assignedTo

  const tasks = parseTasks(root.tasks)
  if (tasks) out.tasks = tasks

  const rawItems = root.lineItems ?? root.line_items ?? root.items
  if (Array.isArray(rawItems)) {
    const items: LineItem[] = []
    for (const it of rawItems) {
      const parsed = parseLineItem(it)
      if (parsed) items.push(parsed)
    }
    if (items.length) out.lineItems = items
  }

  const taxRate = asRate(root.taxRate ?? root.tax_rate ?? root.tax)
  if (taxRate !== undefined) out.taxRate = taxRate

  const overheadRate = asRate(
    root.overheadRate ?? root.overhead_rate ?? root.overhead
  )
  if (overheadRate !== undefined) out.overheadRate = overheadRate

  return out
}
