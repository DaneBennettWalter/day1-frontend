/**
 * Kanban board — drag a document card across the four status columns.
 *
 * dnd-kit primitives:
 *   - DndContext owns the global drag state and the sensors (pointer + keyboard).
 *   - Each column is a `useDroppable` target.
 *   - Each card is a `useDraggable` source (we use the lower-level draggable
 *     here rather than `useSortable` because we only care about column-to-
 *     column drops, not in-column reordering).
 *
 * Status updates fire through `useChangeDocumentStatus`, which already
 * optimistically rewrites the list cache for an instant card move. The
 * dnd handler just calls mutate — the cache is the source of truth.
 *
 * Accessibility: dnd-kit ships keyboard sensors out of the box (space to
 * pick up, arrows to move, space to drop). Screen readers get drag
 * announcements from dnd-kit's default `Announcements`.
 */

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, KanbanSquare, List, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useChangeDocumentStatus,
  useDocumentsList,
} from '../hooks'
import { formatCurrency } from '../calculations'
import {
  DOCUMENT_STATUSES,
  DOCUMENT_TYPE_LABELS,
  type Document,
  type DocumentStatus,
} from '../types'
import { StatusBadge } from './StatusBadge'

export function Kanban() {
  const { data, isLoading, error } = useDocumentsList({})
  const changeStatus = useChangeDocumentStatus()
  const [activeId, setActiveId] = useState<string | null>(null)

  const documents = useMemo(() => data?.documents ?? [], [data?.documents])

  // Group by status. Keep the activeId visible in its original column to
  // avoid a flash on drop.
  const byStatus = useMemo<Record<DocumentStatus, Document[]>>(() => {
    const groups: Record<DocumentStatus, Document[]> = {
      draft: [],
      sent: [],
      approved: [],
      rejected: [],
    }
    for (const d of documents) {
      if (groups[d.status]) groups[d.status].push(d)
      else groups.draft.push(d)
    }
    return groups
  }, [documents])

  const activeDoc = activeId
    ? documents.find((d) => d.id === activeId) ?? null
    : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const doc = documents.find((d) => d.id === active.id)
    if (!doc) return
    const nextStatus = String(over.id) as DocumentStatus
    if (!DOCUMENT_STATUSES.includes(nextStatus)) return
    if (doc.status === nextStatus) return
    changeStatus.mutate({ doc, status: nextStatus })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Drag cards between columns to update status.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/documents">
            <Button variant="outline">
              <List className="h-4 w-4" />
              List view
            </Button>
          </Link>
          <Link to="/documents/new">
            <Button>
              <Plus className="h-4 w-4" />
              New document
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading\u2026
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Failed to load: {error.message}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DOCUMENT_STATUSES.map((s) => (
              <KanbanColumn
                key={s}
                status={s}
                documents={byStatus[s] ?? []}
                activeId={activeId}
              />
            ))}
          </div>
          <DragOverlay>
            {activeDoc ? <DocumentCard doc={activeDoc} dragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {!isLoading && documents.length === 0 ? (
        <div className="rounded-md border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          <KanbanSquare className="mx-auto h-8 w-8" />
          <p className="mt-3">Nothing in the pipeline yet.</p>
          <div className="mt-4">
            <Link to="/documents/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create the first document
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

interface ColumnProps {
  status: DocumentStatus
  documents: Document[]
  activeId: string | null
}

function KanbanColumn({ status, documents, activeId }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[200px] flex-col rounded-md border bg-card transition-colors',
        isOver && 'border-primary/60 bg-primary/5'
      )}
    >
      <header className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <span className="text-xs text-muted-foreground">
            {documents.length}
          </span>
        </div>
      </header>
      <div className="flex-1 space-y-2 p-2">
        {documents.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            Drop here
          </div>
        ) : (
          documents.map((doc) => (
            <DraggableCard
              key={doc.id}
              doc={doc}
              dimmed={activeId === doc.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface DraggableCardProps {
  doc: Document
  dimmed?: boolean
}

function DraggableCard({ doc, dimmed }: DraggableCardProps) {
  const navigate = useNavigate()
  const { setNodeRef, listeners, attributes, transform, isDragging } =
    useDraggable({ id: doc.id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: dimmed || isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-md border bg-background shadow-sm hover:border-foreground/20"
    >
      <div className="flex items-start gap-2 p-3">
        <button
          type="button"
          aria-label="Drag handle"
          className="mt-0.5 cursor-grab rounded p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => navigate(`/documents/${doc.id}/edit`)}
          className="flex-1 text-left"
        >
          <DocumentCardBody doc={doc} />
        </button>
      </div>
    </div>
  )
}

function DocumentCard({ doc, dragging = false }: { doc: Document; dragging?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-md border bg-background p-3 shadow-md',
        dragging && 'cursor-grabbing rotate-1 shadow-lg'
      )}
    >
      <DocumentCardBody doc={doc} />
    </div>
  )
}

function DocumentCardBody({ doc }: { doc: Document }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{DOCUMENT_TYPE_LABELS[doc.type]}</span>
        {doc.number ? <span className="font-mono">\u00b7 {doc.number}</span> : null}
      </div>
      <div className="mt-1 line-clamp-2 text-sm font-medium">
        {doc.title || '(untitled)'}
      </div>
      {doc.customer?.name ? (
        <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {doc.customer.name}
        </div>
      ) : null}
      <div className="mt-2 flex items-center justify-between text-xs">
        <StatusBadge status={doc.status} />
        <span className="tabular-nums text-muted-foreground">
          {formatCurrency(doc.totals?.total ?? 0)}
        </span>
      </div>
    </div>
  )
}

