import { describe, expect, it } from 'vitest'
import { parseAiDocument } from './aiParse'

describe('parseAiDocument', () => {
  it('returns empty for non-objects (no type fallback so caller can detect)', () => {
    expect(parseAiDocument(null)).toEqual({})
    expect(parseAiDocument('garbage')).toEqual({})
    expect(parseAiDocument(undefined)).toEqual({})
  })

  it('applies type fallback when input is an object but lacks type', () => {
    expect(parseAiDocument({ title: 'x' }, 'invoice').type).toBe('invoice')
  })

  it('unwraps nested `document` envelope', () => {
    const r = parseAiDocument({
      document: { title: 'Kitchen reno', type: 'estimate' },
    })
    expect(r.title).toBe('Kitchen reno')
    expect(r.type).toBe('estimate')
  })

  it('keeps fallback type when AI returned garbage', () => {
    const r = parseAiDocument({ type: 'pizza' }, 'invoice')
    expect(r.type).toBe('invoice')
  })

  it('coerces percent rates to decimal', () => {
    const r = parseAiDocument({ taxRate: '8.25%', overheadRate: 10 })
    expect(r.taxRate).toBeCloseTo(0.0825)
    expect(r.overheadRate).toBeCloseTo(0.1)
  })

  it('keeps decimal rates as-is', () => {
    const r = parseAiDocument({ taxRate: 0.0825 })
    expect(r.taxRate).toBeCloseTo(0.0825)
  })

  it('accepts snake_case keys', () => {
    const r = parseAiDocument({
      due_date: '2026-06-01',
      payment_terms: 'Net 30',
      line_items: [
        { description: 'Drywall', quantity: 5, unit_price: '$22.50' },
      ],
    })
    expect(r.dueDate).toBe('2026-06-01')
    expect(r.paymentTerms).toBe('Net 30')
    expect(r.lineItems?.[0]?.unitPrice).toBe(22.5)
    expect(r.lineItems?.[0]?.quantity).toBe(5)
  })

  it('infers labor/material from kind/type fields', () => {
    const r = parseAiDocument({
      items: [
        {
          description: 'Carpenter hours',
          type: 'labor',
          quantity: 10,
          rate: 65,
        },
        {
          description: 'Lumber',
          category: 'Materials',
          quantity: 1,
          price: 800,
        },
      ],
    })
    expect(r.lineItems?.[0]?.kind).toBe('labor')
    expect(r.lineItems?.[0]?.unitPrice).toBe(65)
    expect(r.lineItems?.[1]?.kind).toBe('material')
    expect(r.lineItems?.[1]?.unitPrice).toBe(800)
  })

  it('drops invalid line items without throwing', () => {
    const r = parseAiDocument({
      lineItems: [
        { description: 'Valid', quantity: 1, unitPrice: 10 },
        null,
        'string',
        { quantity: 5 }, // no description
        { description: '' }, // empty description
      ],
    })
    expect(r.lineItems).toHaveLength(1)
    expect(r.lineItems?.[0]?.description).toBe('Valid')
  })

  it('extracts customer block', () => {
    const r = parseAiDocument({
      customer: {
        name: 'Acme Co',
        email: 'a@b.com',
        phone: '555-1212',
        address: '123 Main',
      },
    })
    expect(r.customer?.name).toBe('Acme Co')
    expect(r.customer?.email).toBe('a@b.com')
  })

  it('ignores customer block missing name', () => {
    const r = parseAiDocument({ customer: { email: 'x@y.com' } })
    expect(r.customer).toBeUndefined()
  })

  it('parses work-order tasks array', () => {
    const r = parseAiDocument({
      type: 'work_order',
      tasks: ['Demo old cabinets', '   ', 'Install new'],
    })
    expect(r.tasks).toEqual(['Demo old cabinets', 'Install new'])
  })

  it('strips currency formatting in numbers', () => {
    const r = parseAiDocument({
      lineItems: [{ description: 'X', quantity: '2', unitPrice: '$1,234.56' }],
    })
    expect(r.lineItems?.[0]?.unitPrice).toBeCloseTo(1234.56)
  })

  it('defaults taxable to true, accepts string booleans', () => {
    const r = parseAiDocument({
      lineItems: [
        { description: 'A', unitPrice: 1 },
        { description: 'B', unitPrice: 1, taxable: 'no' },
        { description: 'C', unitPrice: 1, taxable: false },
      ],
    })
    expect(r.lineItems?.[0]?.taxable).toBe(true)
    expect(r.lineItems?.[1]?.taxable).toBe(false)
    expect(r.lineItems?.[2]?.taxable).toBe(false)
  })
})
