/**
 * Document calculation engine.
 *
 * Pure functions, no React. The editor calls these on each commit (debounced)
 * and on save. The server is expected to re-run equivalent logic before
 * persistence — never trust client-computed totals.
 *
 * Rounding: we round to cents (2 decimals) on every aggregate. JavaScript
 * floats accumulate error fast across hundreds of line items; we use a
 * cents-integer pipeline.
 */

import type { DocumentTotals, LineItem } from './types'

/** Round to cents, banker's rounding via Math.round on cents. */
export function roundCents(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

/** Coerce arbitrary input to a non-negative number. */
function toNum(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n) || n < 0) return 0
  return n
}

export function lineTotal(item: Pick<LineItem, 'quantity' | 'unitPrice'>): number {
  return roundCents(toNum(item.quantity) * toNum(item.unitPrice))
}

export interface CalcInput {
  lineItems: LineItem[]
  /** Decimal rate, e.g. 0.0825. */
  taxRate: number
  /** Decimal rate, e.g. 0.10. */
  overheadRate: number
}

/**
 * Compute totals.
 *
 *   subtotal         = Σ lineTotal(i)
 *   taxableSubtotal  = Σ lineTotal(i) where i.taxable
 *   tax              = taxableSubtotal × taxRate
 *   overhead         = subtotal × overheadRate
 *   total            = subtotal + tax + overhead
 *
 * All values rounded to cents.
 */
export function computeTotals(input: CalcInput): DocumentTotals {
  const taxRate = toNum(input.taxRate)
  const overheadRate = toNum(input.overheadRate)

  let subtotal = 0
  let taxableSubtotal = 0
  for (const item of input.lineItems) {
    const t = lineTotal(item)
    subtotal += t
    if (item.taxable) taxableSubtotal += t
  }

  subtotal = roundCents(subtotal)
  taxableSubtotal = roundCents(taxableSubtotal)
  const tax = roundCents(taxableSubtotal * taxRate)
  const overhead = roundCents(subtotal * overheadRate)
  const total = roundCents(subtotal + tax + overhead)

  return { subtotal, taxableSubtotal, tax, overhead, total }
}

export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (!Number.isFinite(value)) value = 0
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

export function formatPercent(rate: number): string {
  if (!Number.isFinite(rate)) rate = 0
  return `${(rate * 100).toFixed(2)}%`
}

/** Split materials vs labor subtotals — useful for bid/estimate display. */
export function splitByKind(lineItems: LineItem[]): {
  material: number
  labor: number
} {
  let material = 0
  let labor = 0
  for (const item of lineItems) {
    const t = lineTotal(item)
    if (item.kind === 'labor') labor += t
    else material += t
  }
  return { material: roundCents(material), labor: roundCents(labor) }
}
