import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureApiClient, request } from './client'
import { ApiError } from './errors'

const originalFetch = globalThis.fetch

function mockFetchOnce(status: number, body?: unknown): void {
  globalThis.fetch = vi.fn().mockResolvedValueOnce(
    new Response(body !== undefined ? JSON.stringify(body) : null, {
      status,
      headers: body !== undefined ? { 'content-type': 'application/json' } : {},
    }),
  ) as unknown as typeof fetch
}

beforeEach(() => {
  configureApiClient({
    getToken: () => 'tok',
    refresh: () => Promise.resolve(true),
    onAuthLost: () => {},
  })
})

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
})

describe('api client', () => {
  it('attaches Authorization header when authed', async () => {
    const spy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    globalThis.fetch = spy as unknown as typeof fetch

    await request('/api/test')
    const call = spy.mock.calls[0] as [string, RequestInit] | undefined
    const headers = (call?.[1]?.headers ?? {}) as Record<string, string>
    expect(headers.Authorization).toBe('Bearer tok')
  })

  it('omits Authorization header when auth:false', async () => {
    const spy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    globalThis.fetch = spy as unknown as typeof fetch

    await request('/api/test', { auth: false })
    const call = spy.mock.calls[0] as [string, RequestInit] | undefined
    const headers = (call?.[1]?.headers ?? {}) as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it('throws ApiError on 4xx (non-401)', async () => {
    mockFetchOnce(400, { message: 'bad' })
    await expect(request('/api/test')).rejects.toBeInstanceOf(ApiError)
  })

  it('on 401: triggers refresh, retries once, returns success', async () => {
    let calls = 0
    globalThis.fetch = vi.fn().mockImplementation(() => {
      calls++
      if (calls === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ message: 'unauthorized' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
          }),
        )
      }
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    }) as unknown as typeof fetch

    const refreshSpy = vi.fn().mockResolvedValue(true)
    const lostSpy = vi.fn()
    configureApiClient({
      getToken: () => 'tok',
      refresh: refreshSpy,
      onAuthLost: lostSpy,
    })

    const result = await request<{ ok: boolean }>('/api/test')
    expect(result.ok).toBe(true)
    expect(refreshSpy).toHaveBeenCalledTimes(1)
    expect(calls).toBe(2)
    expect(lostSpy).not.toHaveBeenCalled()
  })

  it('on 401 with failed refresh: calls onAuthLost and throws', async () => {
    mockFetchOnce(401, { message: 'unauthorized' })
    const refreshSpy = vi.fn().mockResolvedValue(false)
    const lostSpy = vi.fn()
    configureApiClient({
      getToken: () => 'tok',
      refresh: refreshSpy,
      onAuthLost: lostSpy,
    })

    await expect(request('/api/test')).rejects.toBeInstanceOf(ApiError)
    expect(refreshSpy).toHaveBeenCalledTimes(1)
    expect(lostSpy).toHaveBeenCalledTimes(1)
  })

  it('does not loop refresh on retry: 401 on retry throws without refreshing again', async () => {
    let calls = 0
    globalThis.fetch = vi.fn().mockImplementation(() => {
      calls++
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'nope' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      )
    }) as unknown as typeof fetch

    const refreshSpy = vi.fn().mockResolvedValue(true)
    configureApiClient({
      getToken: () => 'tok',
      refresh: refreshSpy,
      onAuthLost: () => {},
    })

    await expect(request('/api/test')).rejects.toBeInstanceOf(ApiError)
    // refresh fired exactly once; original + 1 retry = 2 fetches.
    expect(refreshSpy).toHaveBeenCalledTimes(1)
    expect(calls).toBe(2)
  })
})
