import { describe, it, expect } from 'vitest'
import { formatAmount, parseAmountToCents } from './format'

describe('formatAmount', () => {
  it('formats USD cents as currency', () => {
    expect(formatAmount(0)).toBe('$0.00')
    expect(formatAmount(199)).toBe('$1.99')
    expect(formatAmount(125000)).toBe('$1,250.00')
  })

  it('respects non-USD currency codes', () => {
    // EUR formats with the symbol; we only assert the symbol is present.
    const out = formatAmount(199, 'eur')
    expect(out).toMatch(/€/)
  })
})

describe('parseAmountToCents', () => {
  it('parses common formats', () => {
    expect(parseAmountToCents('19.99')).toBe(1999)
    expect(parseAmountToCents('$1,250.00')).toBe(125000)
    expect(parseAmountToCents('0')).toBe(0)
  })

  it('returns NaN for invalid input', () => {
    expect(Number.isNaN(parseAmountToCents(''))).toBe(true)
    expect(Number.isNaN(parseAmountToCents('abc'))).toBe(true)
  })

  it('avoids float drift', () => {
    expect(parseAmountToCents('0.1')).toBe(10)
    expect(parseAmountToCents('0.30')).toBe(30)
  })
})
