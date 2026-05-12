import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { AlertCircle, RefreshCcw, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '../types'

interface MessageBubbleProps {
  message: ChatMessage
  onRetry?: (messageId: string) => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MessageBubbleImpl({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const isStreaming = message.status === 'streaming'
  const isFailed = message.status === 'failed'

  return (
    <div
      className={cn(
        'flex w-full gap-3 py-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
      data-testid="message-bubble"
      data-role={message.role}
      data-status={message.status}
    >
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}

      <div
        className={cn(
          'group max-w-[80%] rounded-lg px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground',
          isFailed && 'border border-destructive/40'
        )}
      >
        {isAssistant && isStreaming && message.content.length === 0 ? (
          <TypingIndicator />
        ) : (
          <div
            className={cn(
              'prose prose-sm max-w-none break-words',
              'prose-p:my-2 prose-pre:my-2 prose-headings:my-2',
              isUser && 'prose-invert'
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                code({
                  inline,
                  className,
                  children,
                  ...props
                }: {
                  inline?: boolean
                  className?: string
                  children?: React.ReactNode
                } & React.HTMLAttributes<HTMLElement>) {
                  const match = /language-(\w+)/.exec(className ?? '')
                  const text = String(children ?? '').replace(/\n$/, '')
                  if (!inline && match) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: 6,
                          fontSize: '0.85em',
                        }}
                      >
                        {text}
                      </SyntaxHighlighter>
                    )
                  }
                  return (
                    <code
                      className={cn(
                        'rounded bg-black/10 px-1 py-0.5',
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                a({ children, ...props }) {
                  return (
                    <a {...props} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isAssistant && isStreaming && message.content.length > 0 && (
              <span
                aria-label="streaming"
                className="ml-0.5 inline-block h-3 w-2 -translate-y-px animate-pulse bg-current align-middle"
              />
            )}
          </div>
        )}

        {isFailed && (
          <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{message.error ?? 'Failed'}</span>
            {onRetry && message.role === 'user' && (
              <button
                type="button"
                onClick={() => onRetry(message.id)}
                className="ml-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 underline hover:no-underline"
              >
                <RefreshCcw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        )}

        <div
          className={cn(
            'mt-1.5 text-[10px] opacity-60',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 py-1"
      aria-label="Assistant is typing"
    >
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" />
    </div>
  )
}

export const MessageBubble = memo(MessageBubbleImpl)
