/**
 * AI chat domain types.
 *
 * Sessions are client-side in P3 — backend may add persisted conversations in P4.
 * The shape here is designed to forward-port cleanly: a `ChatSession` can be
 * upgraded to a server-backed conversation by adding a server `id` and
 * wiring `loadSession`/`listSessions` to a real endpoint.
 */

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessageStatus = 'sending' | 'streaming' | 'sent' | 'failed'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  /** ISO-8601 timestamp. */
  createdAt: string
  status: ChatMessageStatus
  /** Server error reason when status === 'failed'. */
  error?: string
}

export interface ChatSession {
  id: string
  /** Auto-derived from first user message, or "New conversation". */
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface ChatRequest {
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>
  /** Optional document/context handle, used in P4. */
  context?: Record<string, unknown>
}

export interface ChatResponse {
  /** Full assistant message content (non-streaming path). */
  content: string
}

export interface GenerateRequest {
  description: string
  type?: string
}

export interface GenerateResponse {
  /** Server returns a structured document; we keep it open here for P4. */
  document: Record<string, unknown>
}
