import { describe, expect, it } from 'vitest'
import { contactInputSchema, normalizeContactInput } from './schemas'

describe('contactInputSchema', () => {
  it('accepts valid contact data', () => {
    const valid = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      type: 'customer' as const,
      company: 'Acme Corp',
      address: {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      },
      notes: 'VIP customer',
    }
    expect(() => contactInputSchema.parse(valid)).not.toThrow()
  })

  it('requires name', () => {
    const invalid = {
      type: 'customer',
    }
    expect(() => contactInputSchema.parse(invalid)).toThrow()
  })

  it('requires type', () => {
    const invalid = {
      name: 'John Doe',
    }
    expect(() => contactInputSchema.parse(invalid)).toThrow(/type/)
  })

  it('validates email format', () => {
    const invalid = {
      name: 'John Doe',
      type: 'customer',
      email: 'not-an-email',
    }
    expect(() => contactInputSchema.parse(invalid)).toThrow(/Invalid email/)
  })

  it('accepts empty string for optional fields', () => {
    const data = {
      name: 'John Doe',
      type: 'customer' as const,
      email: '',
      phone: '',
      company: '',
      notes: '',
    }
    expect(() => contactInputSchema.parse(data)).not.toThrow()
  })

  it('accepts all contact types', () => {
    const types = [
      'customer',
      'vendor',
      'contractor',
      'employee',
      'tenant',
      'owner',
      'other',
    ] as const

    types.forEach((type) => {
      const data = { name: 'Test', type }
      expect(() => contactInputSchema.parse(data)).not.toThrow()
    })
  })

  it('normalizeContactInput converts empty strings to undefined', () => {
    const input = {
      name: 'John Doe',
      type: 'customer' as const,
      email: '',
      phone: '  ',
      company: '',
      notes: '   ',
    }
    const normalized = normalizeContactInput(input)
    expect(normalized.email).toBeUndefined()
    expect(normalized.phone).toBeUndefined()
    expect(normalized.company).toBeUndefined()
    expect(normalized.notes).toBeUndefined()
  })

  it('normalizeContactInput preserves non-empty values', () => {
    const input = {
      name: 'John Doe',
      type: 'customer' as const,
      email: 'john@example.com',
      phone: '555-1234',
      company: 'Acme',
      notes: 'VIP',
    }
    const normalized = normalizeContactInput(input)
    expect(normalized.email).toBe('john@example.com')
    expect(normalized.phone).toBe('555-1234')
    expect(normalized.company).toBe('Acme')
    expect(normalized.notes).toBe('VIP')
  })
})
