/**
 * MessageList — auto-scrolls to bottom, virtualizes when long.
 *
 * Strategy:
 *   - Always render the latest message visible.
 *   - "Stick to bottom" only when the user is already near the bottom.
 *     Otherwise let them read scrollback without yanking them down on every
 *     streamed token. (ChatGPT-style.)
 *   - Use `@tanstack/react-virtual` past a threshold (50 messages) — below
 *     that, the virtualizer adds more complexity than it saves.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { MessageBubble } from './MessageBubble'
import type { ChatMessage } from '../types'

const VIRTUALIZE_THRESHOLD = 50
const STICK_TO_BOTTOM_PX = 80

interface MessageListProps {
  messages: ChatMessage[]
  onRetry?: (messageId: string) => void
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  if (messages.length >= VIRTUALIZE_THRESHOLD) {
    return <VirtualizedList messages={messages} onRetry={onRetry} />
  }
  return <SimpleList messages={messages} onRetry={onRetry} />
}

function SimpleList({ messages, onRetry }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)

  // Track whether the user is near the bottom; only auto-scroll if so.
  const onScroll = () => {
    const el = containerRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    stickRef.current = distance < STICK_TO_BOTTOM_PX
  }

  useLayoutEffect(() => {
    if (!stickRef.current) return
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  })

  // Also track content size growth during streaming.
  // (The layout effect handles it because the messages array reference
  // changes on every store update.)

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto px-4"
      data-testid="message-list"
    >
      <div className="mx-auto max-w-3xl">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} onRetry={onRetry} />
        ))}
        <div className="h-4" />
      </div>
    </div>
  )
}

function VirtualizedList({ messages, onRetry }: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [stick, setStick] = useState(true)

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 8,
  })

  const onScroll = () => {
    const el = parentRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    setStick(distance < STICK_TO_BOTTOM_PX)
  }

  const lastLen = messages.length
  const tailContentLen = messages[messages.length - 1]?.content.length ?? 0
  useEffect(() => {
    if (!stick) return
    if (lastLen === 0) return
    virtualizer.scrollToIndex(lastLen - 1, { align: 'end' })
  }, [lastLen, tailContentLen, stick, virtualizer])

  const items = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto px-4"
      data-testid="message-list"
      data-virtualized="true"
    >
      <div className="mx-auto max-w-3xl">
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {items.map((vi) => {
            const message = messages[vi.index]
            if (!message) return null
            return (
              <div
                key={message.id}
                data-index={vi.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vi.start}px)`,
                }}
              >
                <MessageBubble message={message} onRetry={onRetry} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
