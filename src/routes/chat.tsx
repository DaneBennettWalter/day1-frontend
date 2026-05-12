/**
 * /chat — flagship AI chat surface.
 *
 * Layout (desktop):
 *   ┌──────────┬───────────────────────────────────┐
 *   │ sessions │ header (title + Clear + New)      │
 *   │ sidebar  ├───────────────────────────────────┤
 *   │          │ message list (scrollable)         │
 *   │          ├───────────────────────────────────┤
 *   │          │ composer (sticky bottom)          │
 *   └──────────┴───────────────────────────────────┘
 *
 * On mobile the sidebar collapses (lg breakpoint).
 */

import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Eraser, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageList } from '@/features/ai-chat/components/MessageList'
import {
  Composer,
  type ComposerHandle,
} from '@/features/ai-chat/components/Composer'
import { SuggestedPrompts } from '@/features/ai-chat/components/SuggestedPrompts'
import { ConversationSidebar } from '@/features/ai-chat/components/ConversationSidebar'
import { useAiChat, useAiAvailability } from '@/features/ai-chat/hooks'
import { useAiChatStore } from '@/features/ai-chat/store'

export default function ChatRoute() {
  const params = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const composerRef = useRef<ComposerHandle>(null)

  const {
    sessionId,
    messages,
    isStreaming,
    sendMessage,
    retryMessage,
    stop,
    clear,
    newSession,
  } = useAiChat()

  const health = useAiAvailability()
  const aiUnavailable = health.data && health.data.hasAI === false

  // Sync URL ↔ active session.
  useEffect(() => {
    const store = useAiChatStore.getState()
    const urlId = params.conversationId

    if (urlId) {
      // URL has an id: select it if it exists, otherwise drop to /chat.
      if (store.sessions.some((s) => s.id === urlId)) {
        if (store.activeSessionId !== urlId) store.selectSession(urlId)
      } else {
        navigate('/chat', { replace: true })
      }
    } else {
      // No id in URL: if we have an active session, reflect it in the URL.
      // Otherwise leave it bare and let the user start fresh (or pick from sidebar).
      if (store.activeSessionId) {
        navigate(`/chat/${store.activeSessionId}`, { replace: true })
      }
    }
  }, [params.conversationId, navigate])

  const handleNewSession = () => {
    const id = newSession()
    navigate(`/chat/${id}`)
    composerRef.current?.focus()
  }

  const handleSelectSession = (id: string) => {
    useAiChatStore.getState().selectSession(id)
    navigate(`/chat/${id}`)
  }

  const handleSend = (text: string) => {
    const run = async () => {
      await sendMessage(text)
      // After send, ensure URL has a session id.
      const id = useAiChatStore.getState().activeSessionId
      if (id && !params.conversationId) {
        navigate(`/chat/${id}`, { replace: true })
      }
    }
    void run()
  }

  const handlePickSuggestion = (text: string) => {
    composerRef.current?.setValue(text)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 -m-6">
      <ConversationSidebar
        onSelect={handleSelectSession}
        onNew={handleNewSession}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-base font-semibold">AI Assistant</h1>
            {sessionId && messages.length > 0 && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                · {messages.length} message{messages.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={clear}
              disabled={messages.length === 0}
              aria-label="Clear conversation"
            >
              <Eraser className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleNewSession}
              aria-label="New conversation"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </header>

        {/* Body */}
        {aiUnavailable ? (
          <AiUnavailableState />
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <SuggestedPrompts onPick={handlePickSuggestion} />
          </div>
        ) : (
          <MessageList
            messages={messages}
            onRetry={(id) => {
              void retryMessage(id)
            }}
          />
        )}

        {/* Composer */}
        <Composer
          ref={composerRef}
          sessionId={sessionId}
          disabled={aiUnavailable ?? false}
          isStreaming={isStreaming}
          onSend={handleSend}
          onStop={stop}
          placeholder={
            aiUnavailable
              ? 'AI is unavailable — add an API key in Settings.'
              : 'Send a message…'
          }
        />
      </div>
    </div>
  )
}

function AiUnavailableState() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">AI is currently unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The server doesn&apos;t have an AI provider configured. Add an API key
          in settings to enable chat.
        </p>
        <Link
          to="/settings/ai"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Open AI settings
        </Link>
      </div>
    </div>
  )
}
