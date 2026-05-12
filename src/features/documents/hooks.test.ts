import { describe, expect, it } from 'vitest'
import { blankDocument, documentsKeys } from './hooks'

describe('blankDocument', () => {
  it('defaults to a bid with sensible rates and empty lines', () => {
    const d = blankDocument()
    expect(d.type).toBe('bid')
    expect(d.status).toBe('draft')
    expect(d.taxRate).toBe(0.0825)
    expect(d.overheadRate).toBe(0.1)
    expect(d.lineItems).toEqual([])
  })

  it('respects type override', () => {
    expect(blankDocument('invoice').type).toBe('invoice')
    expect(blankDocument('work_order').type).toBe('work_order')
  })
})

describe('documentsKeys', () => {
  it('namespaces queries', () => {
    expect(documentsKeys.all).toEqual(['documents'])
    expect(documentsKeys.detail('abc')).toEqual(['documents', 'detail', 'abc'])
    expect(documentsKeys.list({ type: 'bid' })).toEqual([
      'documents',
      'list',
      { type: 'bid' },
    ])
  })
})
