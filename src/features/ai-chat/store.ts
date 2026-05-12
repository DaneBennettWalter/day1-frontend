/**
 * AI chat store.
 *
 * In-memory (per browser session). Holds one or more `ChatSession`s so the
 * sidebar has something real to switch between. When the backend grows a
 * `/api/conversations` endpoint, we swap the persistence layer here without
 * touching components.
 *
 * Why Zustand and not TanStack Query: messages mutate constantly during
 * streaming. Query's cache model fights that — every token would be a
 * cache write and a re-fetch invalidation. A plain store is the right tool
 * for transient streaming state; we use Query for the conversations *list*
 * (read-mostly) once persisted server-side.
 */

import { create } from 'zustand'
import type { ChatMessage, ChatSession, ChatRole } from './types'

const STORAGE_KEY = 'day1.aiChat.v1'
const MAX_TITLE_LEN = 60

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function deriveTitle(content: string): string {
  const first = content.trim().split('\n')[0] ?? ''
  if (first.length <= MAX_TITLE_LEN) return first || 'New conversation'
  return first.slice(0, MAX_TITLE_LEN - 1).trimEnd() + '…'
}

function newSession(): ChatSession {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    title: 'New conversation',
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
}

interface PersistedShape {
  sessions: ChatSession[]
  activeSessionId: string | null
}

function loadPersisted(): PersistedShape {
  if (typeof window === 'undefined')
    return { sessions: [], activeSessionId: null }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { sessions: [], activeSessionId: null }
    const parsed = JSON.parse(raw) as PersistedShape
    // Trust nothing: defensively coerce.
    if (!Array.isArray(parsed.sessions))
      return { sessions: [], activeSessionId: null }
    return parsed
  } catch {
    return { sessions: [], activeSessionId: null }
  }
}

function persist(state: PersistedShape): void {
  if (typeof window === 'undefined') return
  try {
    // Strip transient `streaming`/`sending` statuses on persist — those don't
    // survive a page reload anyway.
    const cleaned: PersistedShape = {
      activeSessionId: state.activeSessionId,
      sessions: state.sessions.map((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.status === 'streaming' || m.status === 'sending'
            ? { ...m, status: 'failed', error: 'Interrupted' }
            : m
        ),
      })),
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
  } catch {
    // sessionStorage may be full or disabled; non-fatal.
  }
}

interface AiChatState {
  sessions: ChatSession[]
  activeSessionId: string | null
  /** AbortController for the in-flight assistant reply, if any. */
  inflight: AbortController | null

  // --- session lifecycle ---
  createSession: () => string
  selectSession: (id: string) => void
  deleteSession: (id: string) => void
  clearActive: () => void

  // --- message ops ---
  appendMessage: (sessionId: string, message: ChatMessage) => void
  updateMessage: (
    sessionId: string,
    messageId: string,
    patch: Partial<ChatMessage>
  ) => void
  appendDelta: (sessionId: string, messageId: string, delta: string) => void
  removeMessage: (sessionId: string, messageId: string) => void

  // --- helpers ---
  makeMessage: (
    role: ChatRole,
    content: string,
    status?: ChatMessage['status']
  ) => ChatMessage
  setInflight: (ctrl: AbortController | null) => void
  abortInflight: () => void

  // --- selectors ---
  getActiveSession: () => ChatSession | null
}

export const useAiChatStore = create<AiChatState>((set, get) => {
  const initial = loadPersisted()

  return {
    sessions: initial.sessions,
    activeSessionId: initial.activeSessionId,
    inflight: null,

    createSession: () => {
      const session = newSession()
      set((s) => {
        const next = {
          sessions: [session, ...s.sessions],
          activeSessionId: session.id,
        }
        persist({
          sessions: next.sessions,
          activeSessionId: next.activeSessionId,
        })
        return next
      })
      return session.id
    },

    selectSession: (id) => {
      set((s) => {
        if (!s.sessions.some((x) => x.id === id)) return s
        persist({ sessions: s.sessions, activeSessionId: id })
        return { activeSessionId: id }
      })
    },

    deleteSession: (id) => {
      set((s) => {
        const sessions = s.sessions.filter((x) => x.id !== id)
        const activeSessionId =
          s.activeSessionId === id
            ? (sessions[0]?.id ?? null)
            : s.activeSessionId
        persist({ sessions, activeSessionId })
        return { sessions, activeSessionId }
      })
    },

    clearActive: () => {
      set((s) => {
        if (!s.activeSessionId) return s
        const sessions = s.sessions.map((sess) =>
          sess.id === s.activeSessionId
            ? {
                ...sess,
                messages: [],
                title: 'New conversation',
                updatedAt: new Date().toISOString(),
              }
            : sess
        )
        persist({ sessions, activeSessionId: s.activeSessionId })
        return { sessions }
      })
    },

    appendMessage: (sessionId, message) => {
      set((s) => {
        const sessions = s.sessions.map((sess) => {
          if (sess.id !== sessionId) return sess
          const isFirstUser =
            sess.messages.length === 0 && message.role === 'user'
          return {
            ...sess,
            title: isFirstUser ? deriveTitle(message.content) : sess.title,
            messages: [...sess.messages, message],
            updatedAt: new Date().toISOString(),
          }
        })
        persist({ sessions, activeSessionId: s.activeSessionId })
        return { sessions }
      })
    },

    updateMessage: (sessionId, messageId, patch) => {
      set((s) => {
        const sessions = s.sessions.map((sess) => {
          if (sess.id !== sessionId) return sess
          return {
            ...sess,
            messages: sess.messages.map((m) =>
              m.id === messageId ? { ...m, ...patch } : m
            ),
            updatedAt: new Date().toISOString(),
          }
        })
        persist({ sessions, activeSessionId: s.activeSessionId })
        return { sessions }
      })
    },

    appendDelta: (sessionId, messageId, delta) => {
      // Hot path: called once per streamed token. Avoid persist() on every
      // call (writing sessionStorage hundreds of times per response is bad).
      // Persist only when the stream ends via updateMessage().
      set((s) => ({
        sessions: s.sessions.map((sess) => {
          if (sess.id !== sessionId) return sess
          return {
            ...sess,
            messages: sess.messages.map((m) =>
              m.id === messageId ? { ...m, content: m.content + delta } : m
            ),
          }
        }),
      }))
    },

    removeMessage: (sessionId, messageId) => {
      set((s) => {
        const sessions = s.sessions.map((sess) =>
          sess.id !== sessionId
            ? sess
            : {
                ...sess,
                messages: sess.messages.filter((m) => m.id !== messageId),
              }
        )
        persist({ sessions, activeSessionId: s.activeSessionId })
        return { sessions }
      })
    },

    makeMessage: (role, content, status = 'sent') => ({
      id: uuid(),
      role,
      content,
      createdAt: new Date().toISOString(),
      status,
    }),

    setInflight: (ctrl) => set({ inflight: ctrl }),

    abortInflight: () => {
      const ctrl = get().inflight
      if (ctrl) ctrl.abort()
      set({ inflight: null })
    },

    getActiveSession: () => {
      const { sessions, activeSessionId } = get()
      if (!activeSessionId) return null
      return sessions.find((s) => s.id === activeSessionId) ?? null
    },
  }
})

// Test-only reset.
export function __resetAiChatStore(): void {
  useAiChatStore.setState({
    sessions: [],
    activeSessionId: null,
    inflight: null,
  })
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }
}
