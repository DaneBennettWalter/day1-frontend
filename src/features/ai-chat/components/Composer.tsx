/**
 * Composer — autosize textarea + send button.
 *
 * Keyboard:
 *   - Enter alone: send (the common case on desktop chat UIs)
 *   - Shift+Enter: newline
 *   - Cmd/Ctrl+Enter: send (always)
 *   - Escape: clear current draft
 *
 * Drafts persist to `sessionStorage` keyed per session id, so navigating
 * away and back doesn't lose what the user was writing.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DRAFT_PREFIX = 'day1.aiChat.draft.'
const MAX_HEIGHT_PX = 240

export interface ComposerHandle {
  setValue: (next: string) => void
  focus: () => void
}

interface ComposerProps {
  sessionId: string | null
  disabled?: boolean
  isStreaming?: boolean
  onSend: (text: string) => void
  onStop?: () => void
  placeholder?: string
}

export const Composer = forwardRef<ComposerHandle, ComposerProps>(
  function Composer(
    {
      sessionId,
      disabled,
      isStreaming,
      onSend,
      onStop,
      placeholder = 'Send a message…',
    },
    ref
  ) {
    const draftKey = sessionId
      ? `${DRAFT_PREFIX}${sessionId}`
      : `${DRAFT_PREFIX}__pending`
    const [value, setValue] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Load draft on session change.
    useEffect(() => {
      try {
        const saved = window.sessionStorage.getItem(draftKey)
        setValue(saved ?? '')
      } catch {
        setValue('')
      }
    }, [draftKey])

    // Save draft (debounced via sessionStorage write semantics — fast enough).
    useEffect(() => {
      try {
        if (value) window.sessionStorage.setItem(draftKey, value)
        else window.sessionStorage.removeItem(draftKey)
      } catch {
        /* ignore */
      }
    }, [draftKey, value])

    useImperativeHandle(
      ref,
      () => ({
        setValue: (next: string) => {
          setValue(next)
          // Focus and place caret at end so the user can keep typing.
          requestAnimationFrame(() => {
            const el = textareaRef.current
            if (!el) return
            el.focus()
            el.setSelectionRange(next.length, next.length)
          })
        },
        focus: () => textareaRef.current?.focus(),
      }),
      []
    )

    // Autosize.
    useLayoutEffect(() => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = 'auto'
      const next = Math.min(el.scrollHeight, MAX_HEIGHT_PX)
      el.style.height = `${next}px`
    }, [value])

    const submit = useCallback(() => {
      const text = value.trim()
      if (!text || disabled || isStreaming) return
      onSend(text)
      setValue('')
      try {
        window.sessionStorage.removeItem(draftKey)
      } catch {
        /* ignore */
      }
    }, [value, disabled, isStreaming, onSend, draftKey])

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        setValue('')
        return
      }
      if (e.key === 'Enter') {
        // Shift+Enter → newline (default). Cmd/Ctrl+Enter or plain Enter → send.
        if (e.shiftKey) return
        e.preventDefault()
        submit()
      }
    }

    const onChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
      setValue(e.target.value)

    const canSend = value.trim().length > 0 && !disabled && !isStreaming

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="border-t bg-background"
        data-testid="composer"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={placeholder}
            disabled={disabled}
            aria-label="Message"
            className={cn(
              'flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none ring-offset-background',
              'focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60'
            )}
            style={{ maxHeight: MAX_HEIGHT_PX }}
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="outline"
              onClick={onStop}
              aria-label="Stop generating"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!canSend} aria-label="Send message">
              <Send className="h-4 w-4" />
              Send
            </Button>
          )}
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-2 text-[11px] text-muted-foreground">
          Press <kbd className="rounded border bg-muted px-1">Enter</kbd> to
          send, <kbd className="rounded border bg-muted px-1">Shift</kbd>+
          <kbd className="rounded border bg-muted px-1">Enter</kbd> for newline.
        </div>
      </form>
    )
  }
)
