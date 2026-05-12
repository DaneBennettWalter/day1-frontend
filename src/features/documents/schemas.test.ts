import { describe, expect, it } from 'vitest'
import { documentInputSchema, lineItemSchema } from './schemas'

describe('lineItemSchema', () => {
  it('accepts a valid line item', () => {
    const r = lineItemSchema.safeParse({
      id: 'a',
      description: 'Drywall',
      kind: 'material',
      quantity: 3,
      unitPrice: 12.5,
      taxable: true,
    })
    expect(r.success).toBe(true)
  })

  it('coerces numeric strings', () => {
    const r = lineItemSchema.safeParse({
      id: 'a',
      description: 'Labor',
      kind: 'labor',
      quantity: '4',
      unitPrice: '20',
      taxable: false,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.quantity).toBe(4)
      expect(r.data.unitPrice).toBe(20)
    }
  })

  it('rejects negative quantity', () => {
    const r = lineItemSchema.safeParse({
      id: 'a',
      description: 'X',
      kind: 'material',
      quantity: -1,
      unitPrice: 10,
      taxable: true,
    })
    expect(r.success).toBe(false)
  })

  it('rejects empty description', () => {
    const r = lineItemSchema.safeParse({
      id: 'a',
      description: '   ',
      kind: 'material',
      quantity: 1,
      unitPrice: 10,
      taxable: true,
    })
    expect(r.success).toBe(false)
  })
})

describe('documentInputSchema', () => {
  const base = {
    type: 'bid' as const,
    status: 'draft' as const,
    title: 'Kitchen renovation',
    lineItems: [],
    taxRate: 0.0825,
    overheadRate: 0.1,
  }

  it('accepts a minimal valid document', () => {
    const r = documentInputSchema.safeParse(base)
    expect(r.success).toBe(true)
  })

  it('rejects taxRate >1 (caller should use decimal form)', () => {
    const r = documentInputSchema.safeParse({ ...base, taxRate: 8.25 })
    expect(r.success).toBe(false)
  })

  it('rejects missing title', () => {
    const r = documentInputSchema.safeParse({ ...base, title: '' })
    expect(r.success).toBe(false)
  })

  it('accepts empty email string', () => {
    const r = documentInputSchema.safeParse({
      ...base,
      customer: { name: 'Acme', email: '' },
    })
    expect(r.success).toBe(true)
  })

  it('rejects malformed email', () => {
    const r = documentInputSchema.safeParse({
      ...base,
      customer: { name: 'Acme', email: 'not-an-email' },
    })
    expect(r.success).toBe(false)
  })
})
