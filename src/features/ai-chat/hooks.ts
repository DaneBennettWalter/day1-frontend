/**
 * AI chat hooks.
 *
 * The streaming/buffered branching lives in `api.ts`. From the UI's view:
 *   - call `sendMessage(text)`
 *   - watch `session.messages` in the store — they update as tokens arrive
 *
 * The hook is robust to:
 *   - User aborting mid-stream (navigates away or hits Stop)
 *   - Network/server failure (assistant message marked `failed`, retryable)
 *   - First message in a fresh session (creates session lazily)
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { aiChatApi } from './api'
import { useAiChatStore } from './store'
import type { ChatMessage } from './types'
import { request } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { HealthResponse } from '@/features/settings/types'

interface UseAiChatResult {
  sessionId: string | null
  messages: ChatMessage[]
  isStreaming: boolean
  sendMessage: (content: string) => Promise<void>
  retryMessage: (failedUserMessageId: string) => Promise<void>
  stop: () => void
  clear: () => void
  newSession: () => string
}

export function useAiChat(): UseAiChatResult {
  const sessions = useAiChatStore((s) => s.sessions)
  const activeSessionId = useAiChatStore((s) => s.activeSessionId)
  const session = activeSessionId
    ? (sessions.find((s) => s.id === activeSessionId) ?? null)
    : null

  const [isStreaming, setIsStreaming] = useState(false)
  // Track in-flight abort controller in a ref so unmount can cancel.
  const inflightRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      // Abort any in-flight request when the consumer unmounts.
      inflightRef.current?.abort()
      inflightRef.current = null
    }
  }, [])

  const send = useCallback(async (content: string, sessionId: string) => {
    const store = useAiChatStore.getState()

    // Build the message history we're going to send to the server. Snapshot
    // BEFORE we append the new user message so we control exactly what gets
    // sent (no streaming-placeholder bleed-through).
    const currentSession = store.sessions.find((s) => s.id === sessionId)
    const priorHistory =
      currentSession?.messages
        .filter((m) => m.status === 'sent')
        .map((m) => ({ role: m.role, content: m.content })) ?? []

    const userMessage = store.makeMessage('user', content, 'sent')
    store.appendMessage(sessionId, userMessage)

    const assistantMessage = store.makeMessage('assistant', '', 'streaming')
    store.appendMessage(sessionId, assistantMessage)

    const controller = new AbortController()
    inflightRef.current = controller
    store.setInflight(controller)
    setIsStreaming(true)

    try {
      await aiChatApi.streamChat({
        messages: [...priorHistory, { role: 'user', content }],
        signal: controller.signal,
        onToken: (delta) => {
          useAiChatStore
            .getState()
            .appendDelta(sessionId, assistantMessage.id, delta)
        },
      })
      useAiChatStore
        .getState()
        .updateMessage(sessionId, assistantMessage.id, { status: 'sent' })
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError'
      const reason = aborted
        ? 'Stopped'
        : err instanceof Error
          ? err.message
          : 'Failed to get response'
      useAiChatStore.getState().updateMessage(sessionId, assistantMessage.id, {
        status: 'failed',
        error: reason,
      })
    } finally {
      if (inflightRef.current === controller) inflightRef.current = null
      useAiChatStore.getState().setInflight(null)
      setIsStreaming(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const store = useAiChatStore.getState()
      let sessionId = store.activeSessionId
      if (!sessionId || !store.sessions.some((s) => s.id === sessionId)) {
        sessionId = store.createSession()
      }
      await send(trimmed, sessionId)
    },
    [send]
  )

  const retryMessage = useCallback(
    async (failedUserMessageId: string) => {
      const store = useAiChatStore.getState()
      const sessionId = store.activeSessionId
      if (!sessionId) return
      const sess = store.sessions.find((s) => s.id === sessionId)
      if (!sess) return
      const idx = sess.messages.findIndex((m) => m.id === failedUserMessageId)
      if (idx === -1) return
      const userMessage = sess.messages[idx]
      if (!userMessage || userMessage.role !== 'user') return

      // Drop the failed user msg and any trailing assistant attempts.
      const trailingIds = sess.messages.slice(idx).map((m) => m.id)
      trailingIds.forEach((id) => store.removeMessage(sessionId, id))

      await send(userMessage.content, sessionId)
    },
    [send]
  )

  const stop = useCallback(() => {
    inflightRef.current?.abort()
  }, [])

  const clear = useCallback(() => {
    inflightRef.current?.abort()
    useAiChatStore.getState().clearActive()
  }, [])

  const newSession = useCallback(() => {
    inflightRef.current?.abort()
    return useAiChatStore.getState().createSession()
  }, [])

  return {
    sessionId: activeSessionId,
    messages: session?.messages ?? [],
    isStreaming,
    sendMessage,
    retryMessage,
    stop,
    clear,
    newSession,
  }
}

/**
 * Polls `/api/health` to know whether AI is configured server-side.
 * Used by the chat route to show the "AI unavailable" empty state.
 */
export function useAiAvailability() {
  return useQuery({
    queryKey: ['ai', 'health'],
    queryFn: () => request<HealthResponse>(endpoints.settings.health),
    staleTime: 60_000,
  })
}

/**
 * P4-facing: AI document generation. Wired here so the chat feature owns
 * everything under `/api/ai/*` and P4 consumes it via a stable hook.
 */
export function useGenerateDocument() {
  return useMutation({
    mutationFn: aiChatApi.generate,
  })
}
