import { describe, it, expect, vi, beforeEach } from 'vitest'
import { streamChat } from './api'

function sseBody(frames: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const f of frames) {
        controller.enqueue(enc.encode(f))
      }
      controller.close()
    },
  })
}

function mockResponse(
  body: ReadableStream<Uint8Array> | string,
  contentType: string
): Response {
  const headers = new Headers({ 'content-type': contentType })
  if (typeof body === 'string') {
    return new Response(body, { status: 200, headers })
  }
  return new Response(body, { status: 200, headers })
}

describe('streamChat', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('parses SSE frames with raw text deltas', async () => {
    // Per SSE convention, the parser strips the conventional space after `data:`,
    // so emit explicit content (with no relying on that single space for word breaks).
    const body = sseBody([
      'data: Hello \n\n',
      'data: world\n\n',
      'data: [DONE]\n\n',
    ])
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockResponse(body, 'text/event-stream'))
    )

    const tokens: string[] = []
    const result = await streamChat({
      messages: [{ role: 'user', content: 'hi' }],
      signal: new AbortController().signal,
      onToken: (d) => tokens.push(d),
    })
    expect(tokens).toEqual(['Hello ', 'world'])
    expect(result).toBe('Hello world')
  })

  it('parses SSE frames with JSON delta envelopes', async () => {
    const body = sseBody([
      'data: {"delta":"Hel"}\n\n',
      'data: {"delta":"lo"}\n\n',
      'data: [DONE]\n\n',
    ])
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockResponse(body, 'text/event-stream'))
    )

    const tokens: string[] = []
    await streamChat({
      messages: [{ role: 'user', content: 'hi' }],
      signal: new AbortController().signal,
      onToken: (d) => tokens.push(d),
    })
    expect(tokens.join('')).toBe('Hello')
  })

  it('falls back to JSON when server returns application/json', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          mockResponse(
            JSON.stringify({ content: 'Hello!' }),
            'application/json'
          )
        )
    )

    const tokens: string[] = []
    const result = await streamChat({
      messages: [{ role: 'user', content: 'hi' }],
      signal: new AbortController().signal,
      onToken: (d) => tokens.push(d),
    })
    expect(tokens).toEqual(['Hello!'])
    expect(result).toBe('Hello!')
  })

  it('throws AbortError when controller aborts mid-stream', async () => {
    const controller = new AbortController()
    const enc = new TextEncoder()
    const body = new ReadableStream<Uint8Array>({
      start(ctrl) {
        ctrl.enqueue(enc.encode('data: Hello\n\n'))
        // never close; we'll abort.
      },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockResponse(body, 'text/event-stream'))
    )

    const tokens: string[] = []
    const promise = streamChat({
      messages: [{ role: 'user', content: 'hi' }],
      signal: controller.signal,
      onToken: (d) => {
        tokens.push(d)
        controller.abort()
      },
    })
    await expect(promise).rejects.toThrow()
    expect(tokens).toEqual(['Hello'])
  })
})
