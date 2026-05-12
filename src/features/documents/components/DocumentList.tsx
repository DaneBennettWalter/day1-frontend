/**
 * Sortable, filterable, virtualized document list.
 *
 * Uses @tanstack/react-table for headless table logic + sorting and
 * @tanstack/react-virtual for row virtualization. Auto-virtualizes past
 * 100 rows per spec.
 *
 * Empty state, loading skeleton, and error UI are inline — no separate
 * components needed at this scale.
 */

import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  FileText,
  KanbanSquare,
  Plus,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDocumentsList } from '../hooks'
import {
  DOCUMENT_STATUSES,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  SHIPPED_TYPES,
  type Document,
  type DocumentStatus,
  type DocumentType,
  type ListDocumentsParams,
} from '../types'
import { formatCurrency } from '../calculations'
import { StatusBadge } from './StatusBadge'

const VIRTUALIZE_THRESHOLD = 100

export function DocumentList() {
  const [type, setType] = useState<DocumentType | ''>('')
  const [status, setStatus] = useState<DocumentStatus | ''>('')
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const params: ListDocumentsParams = useMemo(
    () => ({
      type: type || undefined,
      status: status || undefined,
      q: q || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [type, status, q, from, to]
  )

  const { data, isLoading, error, isFetching } = useDocumentsList(params)
  const documents = data?.documents ?? []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Bids, invoices, estimates, work orders, and proposals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/documents/kanban">
            <Button variant="outline">
              <KanbanSquare className="h-4 w-4" />
              Kanban
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

      {/* Filter bar */}
      <div className="grid grid-cols-1 gap-2 rounded-md border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, number\u2026"
            className="h-9 pl-8"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DocumentType | '')}
          className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All types</option>
          {SHIPPED_TYPES.map((t) => (
            <option key={t} value={t}>
              {DOCUMENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as DocumentStatus | '')}
          className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {DOCUMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {DOCUMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-9"
          aria-label="From date"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-9"
          aria-label="To date"
        />
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading documents\u2026
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Failed to load documents: {error.message}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState />
      ) : (
        <DocumentsTable documents={documents} fetching={isFetching} />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed bg-card p-10 text-center">
      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-3 text-sm font-semibold">No documents yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Start by creating a bid, invoice, or estimate.
      </p>
      <div className="mt-4">
        <Link to="/documents/new">
          <Button>
            <Plus className="h-4 w-4" />
            New document
          </Button>
        </Link>
      </div>
    </div>
  )
}

interface TableProps {
  documents: Document[]
  fetching: boolean
}

function DocumentsTable({ documents, fetching }: TableProps) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'updatedAt', desc: true },
  ])

  const columns = useMemo<ColumnDef<Document>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        cell: (info) => (
          <span className="font-mono text-xs">
            {info.getValue<string>() || '\u2014'}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: (info) => (
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {DOCUMENT_TYPE_LABELS[info.getValue<DocumentType>()]}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: (info) => (
          <span className="line-clamp-1 font-medium">
            {info.getValue<string>() || '(untitled)'}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.customer?.name ?? '',
        id: 'customer',
        header: 'Customer',
        cell: (info) => {
          const v = info.getValue<string>()
          return (
            <span className="line-clamp-1 text-sm text-muted-foreground">
              {v || '\u2014'}
            </span>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => (
          <StatusBadge status={info.getValue<DocumentStatus>()} />
        ),
        size: 110,
      },
      {
        accessorFn: (row) => row.totals?.total ?? 0,
        id: 'total',
        header: 'Total',
        cell: (info) => (
          <span className="tabular-nums">
            {formatCurrency(info.getValue<number>())}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: (info) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(info.getValue<string>())}
          </span>
        ),
        size: 110,
      },
    ],
    []
  )

  const table = useReactTable({
    data: documents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows
  const parentRef = useRef<HTMLDivElement | null>(null)
  const shouldVirtualize = rows.length > VIRTUALIZE_THRESHOLD

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
    enabled: shouldVirtualize,
  })

  const virtualItems = shouldVirtualize ? virtualizer.getVirtualItems() : []
  const totalSize = shouldVirtualize ? virtualizer.getTotalSize() : 0

  return (
    <div className="rounded-md border bg-card">
      <div className="border-b px-3 py-2 text-xs text-muted-foreground">
        {documents.length} document{documents.length === 1 ? '' : 's'}
        {fetching ? ' \u00b7 updating\u2026' : ''}
        {shouldVirtualize ? ' \u00b7 virtualized' : ''}
      </div>
      <div ref={parentRef} className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card text-xs uppercase tracking-wider text-muted-foreground shadow-[inset_0_-1px_0] shadow-border">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const sort = h.column.getIsSorted()
                  const canSort = h.column.getCanSort()
                  return (
                    <th
                      key={h.id}
                      style={{ width: h.column.columnDef.size }}
                      className="px-3 py-2 text-left"
                    >
                      <button
                        type="button"
                        onClick={
                          canSort
                            ? h.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={
                          canSort
                            ? 'inline-flex items-center gap-1 hover:text-foreground'
                            : 'inline-flex items-center gap-1'
                        }
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sort === 'asc' ? (
                          <ArrowUpAZ className="h-3 w-3" />
                        ) : sort === 'desc' ? (
                          <ArrowDownAZ className="h-3 w-3" />
                        ) : null}
                      </button>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          {shouldVirtualize ? (
            <tbody style={{ height: totalSize, position: 'relative' }}>
              {virtualItems.map((vi) => {
                const row = rows[vi.index]
                if (!row) return null
                return (
                  <tr
                    key={row.id}
                    onClick={() =>
                      navigate(`/documents/${row.original.id}/edit`)
                    }
                    className="absolute left-0 right-0 cursor-pointer border-b hover:bg-secondary/50"
                    style={{
                      top: 0,
                      transform: `translateY(${vi.start}px)`,
                      height: vi.size,
                      display: 'table',
                      tableLayout: 'fixed',
                      width: '100%',
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.columnDef.size }}
                        className="px-3 py-3 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          ) : (
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/documents/${row.original.id}/edit`)}
                  className="cursor-pointer border-b hover:bg-secondary/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.columnDef.size }}
                      className="px-3 py-3 align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}
