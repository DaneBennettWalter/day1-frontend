import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './schemas'

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: 'hunter22' })
    expect(r.success).toBe(true)
  })
  it('rejects empty email', () => {
    const r = loginSchema.safeParse({ email: '', password: 'x' })
    expect(r.success).toBe(false)
  })
  it('rejects malformed email', () => {
    const r = loginSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(r.success).toBe(false)
  })
  it('rejects empty password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(r.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts valid input', () => {
    const r = registerSchema.safeParse({
      name: 'Dane',
      email: 'a@b.com',
      password: 'hunter22',
    })
    expect(r.success).toBe(true)
  })
  it('rejects short password', () => {
    const r = registerSchema.safeParse({
      name: 'Dane',
      email: 'a@b.com',
      password: 'short',
    })
    expect(r.success).toBe(false)
  })
  it('rejects empty name', () => {
    const r = registerSchema.safeParse({
      name: '',
      email: 'a@b.com',
      password: 'hunter22',
    })
    expect(r.success).toBe(false)
  })
})
