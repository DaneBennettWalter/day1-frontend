/**
 * Settings schemas tests
 */
import { describe, it, expect } from 'vitest'
import {
  generalSettingsSchema,
  brandingSettingsSchema,
  defaultsSettingsSchema,
  aiSettingsSchema,
} from './schemas'

describe('generalSettingsSchema', () => {
  it('accepts valid company info', () => {
    const result = generalSettingsSchema.safeParse({
      name: 'Acme Construction',
      description: 'Building the future',
      address: '123 Main St',
      phone: '555-0100',
      email: 'contact@acme.com',
      ein: '12-3456789',
    })
    expect(result.success).toBe(true)
  })

  it('requires organization name', () => {
    const result = generalSettingsSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('required')
    }
  })

  it('rejects invalid email', () => {
    const result = generalSettingsSchema.safeParse({
      name: 'Test',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid email')
    }
  })

  it('accepts empty email string', () => {
    const result = generalSettingsSchema.safeParse({
      name: 'Test',
      email: '',
    })
    expect(result.success).toBe(true)
  })
})

describe('brandingSettingsSchema', () => {
  it('accepts valid hex colors', () => {
    const result = brandingSettingsSchema.safeParse({
      primaryColor: '#3b82f6',
      accentColor: '#10b981',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid hex colors', () => {
    const result = brandingSettingsSchema.safeParse({
      primaryColor: 'blue',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('hex color')
    }
  })

  it('rejects short hex codes', () => {
    const result = brandingSettingsSchema.safeParse({
      primaryColor: '#fff',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid theme values', () => {
    const themes = ['light', 'dark', 'system'] as const
    themes.forEach((theme) => {
      const result = brandingSettingsSchema.safeParse({ theme })
      expect(result.success).toBe(true)
    })
  })
})

describe('defaultsSettingsSchema', () => {
  it('accepts valid rates', () => {
    const result = defaultsSettingsSchema.safeParse({
      taxRate: 8.5,
      overheadRate: 15,
      paymentTerms: 30,
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative tax rate', () => {
    const result = defaultsSettingsSchema.safeParse({ taxRate: -1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('0 or greater')
    }
  })

  it('rejects tax rate over 100', () => {
    const result = defaultsSettingsSchema.safeParse({ taxRate: 101 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('cannot exceed 100')
    }
  })

  it('rejects negative overhead rate', () => {
    const result = defaultsSettingsSchema.safeParse({ overheadRate: -5 })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer payment terms', () => {
    const result = defaultsSettingsSchema.safeParse({ paymentTerms: 30.5 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('whole number')
    }
  })
})

describe('aiSettingsSchema', () => {
  it('accepts valid Anthropic API key', () => {
    const result = aiSettingsSchema.safeParse({
      apiKey: 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz',
    })
    expect(result.success).toBe(true)
  })

  it('rejects keys that do not start with sk-ant-', () => {
    const result = aiSettingsSchema.safeParse({
      apiKey: 'sk-other-1234567890abcdefghijklmnopqrst',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('sk-ant-')
    }
  })

  it('rejects short keys', () => {
    const result = aiSettingsSchema.safeParse({ apiKey: 'sk-ant-123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('invalid')
    }
  })
})
