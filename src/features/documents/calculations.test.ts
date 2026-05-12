import { describe, expect, it } from 'vitest'
import {
  computeTotals,
  formatCurrency,
  formatPercent,
  lineTotal,
  roundCents,
  splitByKind,
} from './calculations'
import type { LineItem } from './types'

function li(partial: Partial<LineItem> = {}): LineItem {
  return {
    id: partial.id ?? 'x',
    description: partial.description ?? 'item',
    kind: partial.kind ?? 'material',
    quantity: partial.quantity ?? 1,
    unitPrice: partial.unitPrice ?? 0,
    taxable: partial.taxable ?? true,
  }
}

describe('roundCents', () => {
  it('rounds to 2 decimal places', () => {
    // Note: 1.005 * 100 is 100.49999… in IEEE-754, so Math.round → 100 → 1.00.
    // We accept this — banker-style precision is out of scope. Document it.
    expect(roundCents(1.006)).toBe(1.01)
    expect(roundCents(1.004)).toBe(1.0)
    expect(roundCents(2.005)).toBe(2.01)
    expect(roundCents(0)).toBe(0)
  })

  it('coerces non-finite to 0', () => {
    expect(roundCents(Number.NaN)).toBe(0)
    expect(roundCents(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('lineTotal', () => {
  it('multiplies quantity × unit price, rounded', () => {
    expect(lineTotal({ quantity: 3, unitPrice: 9.99 })).toBe(29.97)
    expect(lineTotal({ quantity: 0, unitPrice: 100 })).toBe(0)
  })

  it('clamps negative inputs to 0', () => {
    expect(lineTotal({ quantity: -1, unitPrice: 10 })).toBe(0)
    expect(lineTotal({ quantity: 5, unitPrice: -2 })).toBe(0)
  })

  it('coerces string-ish inputs', () => {
    // Form inputs occasionally arrive as strings.
    expect(
      lineTotal({
        quantity: '4' as unknown as number,
        unitPrice: '2.5' as unknown as number,
      })
    ).toBe(10)
  })
})

describe('computeTotals', () => {
  it('returns zeros for empty input', () => {
    expect(
      computeTotals({ lineItems: [], taxRate: 0.0825, overheadRate: 0.1 })
    ).toEqual({
      subtotal: 0,
      taxableSubtotal: 0,
      tax: 0,
      overhead: 0,
      total: 0,
    })
  })

  it('subtotal = Σ qty × unit', () => {
    const totals = computeTotals({
      lineItems: [
        li({ quantity: 2, unitPrice: 50, taxable: true }),
        li({ quantity: 1, unitPrice: 25, taxable: true }),
      ],
      taxRate: 0,
      overheadRate: 0,
    })
    expect(totals.subtotal).toBe(125)
    expect(totals.taxableSubtotal).toBe(125)
    expect(totals.total).toBe(125)
  })

  it('excludes non-taxable items from tax base', () => {
    const totals = computeTotals({
      lineItems: [
        li({ quantity: 1, unitPrice: 100, taxable: true }),
        li({ quantity: 1, unitPrice: 100, taxable: false }),
      ],
      taxRate: 0.1,
      overheadRate: 0,
    })
    expect(totals.subtotal).toBe(200)
    expect(totals.taxableSubtotal).toBe(100)
    expect(totals.tax).toBe(10) // 10% of 100, not 200
    expect(totals.total).toBe(210)
  })

  it('applies overhead to full subtotal', () => {
    const totals = computeTotals({
      lineItems: [li({ quantity: 1, unitPrice: 1000, taxable: false })],
      taxRate: 0,
      overheadRate: 0.15,
    })
    expect(totals.subtotal).toBe(1000)
    expect(totals.overhead).toBe(150)
    expect(totals.total).toBe(1150)
  })

  it('rounds aggregates to cents', () => {
    const totals = computeTotals({
      lineItems: [
        li({ quantity: 3, unitPrice: 9.99, taxable: true }),
        li({ quantity: 7, unitPrice: 3.33, taxable: true }),
      ],
      taxRate: 0.0825,
      overheadRate: 0.1,
    })
    // 29.97 + 23.31 = 53.28
    expect(totals.subtotal).toBe(53.28)
    expect(totals.taxableSubtotal).toBe(53.28)
    // 53.28 * 0.0825 = 4.3956 → 4.40
    expect(totals.tax).toBe(4.4)
    // 53.28 * 0.10 = 5.328 → 5.33
    expect(totals.overhead).toBe(5.33)
    // 53.28 + 4.40 + 5.33 = 63.01
    expect(totals.total).toBe(63.01)
  })

  it('handles invalid rates by coercing to 0', () => {
    const totals = computeTotals({
      lineItems: [li({ quantity: 1, unitPrice: 100, taxable: true })],
      taxRate: Number.NaN,
      overheadRate: -0.5,
    })
    expect(totals.tax).toBe(0)
    expect(totals.overhead).toBe(0)
    expect(totals.total).toBe(100)
  })
})

describe('splitByKind', () => {
  it('separates materials and labor', () => {
    const split = splitByKind([
      li({ quantity: 2, unitPrice: 100, kind: 'material' }),
      li({ quantity: 4, unitPrice: 50, kind: 'labor' }),
      li({ quantity: 1, unitPrice: 75, kind: 'material' }),
    ])
    expect(split.material).toBe(275)
    expect(split.labor).toBe(200)
  })
})

describe('formatters', () => {
  it('formats currency to USD by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats percent', () => {
    expect(formatPercent(0.0825)).toBe('8.25%')
    expect(formatPercent(0.1)).toBe('10.00%')
  })
})
