/**
 * ConversationSidebar — lists in-memory sessions, lets user switch/delete.
 *
 * Sessions live in `useAiChatStore` (sessionStorage-backed). When the backend
 * adds `/api/conversations`, swap the source — props stay the same.
 */

import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { useAiChatStore } from '../store'
import { cn } from '@/lib/utils'

interface ConversationSidebarProps {
  onSelect: (id: string) => void
  onNew: () => void
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString()
}

export function ConversationSidebar({
  onSelect,
  onNew,
}: ConversationSidebarProps) {
  const sessions = useAiChatStore((s) => s.sessions)
  const activeId = useAiChatStore((s) => s.activeSessionId)
  const deleteSession = useAiChatStore((s) => s.deleteSession)

  // Sort newest-first.
  const sorted = [...sessions].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  )

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex"
      data-testid="conversation-sidebar"
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        <span className="text-sm font-semibold">Conversations</span>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground"
          aria-label="New conversation"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {sorted.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {sorted.map((s) => {
              const isActive = s.id === activeId
              return (
                <li key={s.id}>
                  <div
                    className={cn(
                      'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'hover:bg-secondary/60'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(s.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      <span className="min-w-0 flex-1 truncate">{s.title}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelative(s.updatedAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSession(s.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
                      aria-label={`Delete ${s.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )
}
