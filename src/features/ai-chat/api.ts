/**
 * AI chat API client.
 *
 * Two paths:
 *   1. `chat()` — buffered JSON response. Simple, works with any backend.
 *   2. `streamChat()` — Server-Sent Events / chunked text. Emits incremental
 *      tokens via the `onToken` callback. Falls back to a final-buffer flush
 *      when the response is non-streaming JSON.
 *
 * The backend may speak either. We probe `Content-Type` and dispatch.
 * UI code goes through hooks and never touches this branching directly.
 */

import { env } from '@/lib/env'
import { ApiError } from '@/lib/api/errors'
import { request } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { useAuthStore } from '@/features/auth/store'
import type {
  ChatRequest,
  ChatResponse,
  GenerateRequest,
  GenerateResponse,
} from './types'

export interface StreamChatOptions extends ChatRequest {
  signal: AbortSignal
  /** Called for each incremental token/chunk of assistant content. */
  onToken: (delta: string) => void
}

/**
 * Buffered chat — used when the caller doesn't care about streaming.
 */
export function chat(
  req: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  return request<ChatResponse>(endpoints.ai.chat, {
    method: 'POST',
    body: req,
    signal,
  })
}

/**
 * Streaming chat. Resolves with the final assembled content once the stream
 * terminates. Emits incremental tokens via `onToken` as they arrive.
 *
 * Supports two server formats:
 *   - SSE: `text/event-stream`, lines `data: <json or text>\n\n`.
 *     We accept either a raw token string or `{"delta": "..."}`/`{"content": "..."}`.
 *     `data: [DONE]` terminates.
 *   - Plain chunked text: any other 2xx `Content-Type` is treated as a single
 *     buffered response (token emitted once, before resolve).
 */
export async function streamChat(opts: StreamChatOptions): Promise<string> {
  const { signal, onToken, ...body } = opts

  const token = useAuthStore.getState().accessToken
  const headers: Record<string, string> = {
    Accept: 'text/event-stream, application/json',
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${env.VITE_API_BASE_URL}${endpoints.ai.chat}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      0,
      'NETWORK_ERROR'
    )
  }

  if (!res.ok) throw await ApiError.fromResponse(res)

  const contentType = res.headers.get('content-type') ?? ''

  // SSE path
  if (contentType.includes('text/event-stream') && res.body) {
    return readSse(res.body, onToken, signal)
  }

  // JSON path
  if (contentType.includes('application/json')) {
    const json = (await res.json()) as ChatResponse
    onToken(json.content)
    return json.content
  }

  // Plain text / chunked fallback
  if (res.body) {
    return readPlain(res.body, onToken, signal)
  }

  const text = await res.text()
  onToken(text)
  return text
}

async function readSse(
  body: ReadableStream<Uint8Array>,
  onToken: (delta: string) => void,
  signal: AbortSignal
): Promise<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  try {
    for (;;) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE frames are separated by blank lines.
      let sep: number
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)
        const delta = parseSseFrame(frame)
        if (delta === '[DONE]') return full
        if (delta) {
          full += delta
          onToken(delta)
        }
      }
    }
    // Flush trailing partial frame, if any.
    if (buffer.trim()) {
      const delta = parseSseFrame(buffer)
      if (delta && delta !== '[DONE]') {
        full += delta
        onToken(delta)
      }
    }
  } finally {
    reader.releaseLock()
  }
  return full
}

function parseSseFrame(frame: string): string | null {
  // Concatenate all `data:` lines in the frame.
  const dataLines = frame
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trimStart())
  if (dataLines.length === 0) return null
  const raw = dataLines.join('\n')
  if (raw === '[DONE]') return '[DONE]'

  // Try JSON delta envelope; fall back to raw string.
  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      const obj = JSON.parse(raw) as {
        delta?: string
        content?: string
        text?: string
      }
      return obj.delta ?? obj.content ?? obj.text ?? ''
    } catch {
      // Not JSON, treat as raw token.
    }
  }
  return raw
}

async function readPlain(
  body: ReadableStream<Uint8Array>,
  onToken: (delta: string) => void,
  signal: AbortSignal
): Promise<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  try {
    for (;;) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      full += chunk
      onToken(chunk)
    }
  } finally {
    reader.releaseLock()
  }
  return full
}

export function generate(req: GenerateRequest): Promise<GenerateResponse> {
  return request<GenerateResponse>(endpoints.ai.generate, {
    method: 'POST',
    body: req,
  })
}

export const aiChatApi = { chat, streamChat, generate }
