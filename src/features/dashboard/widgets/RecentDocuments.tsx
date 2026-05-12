/**
 * Recent Documents Widget
 *
 * Displays the 10 most recently updated documents with type badges and links.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentDocuments } from '../hooks'
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
} from '@/features/documents/types'

function DocumentListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function RecentDocuments() {
  const { data, isLoading, isError, error, refetch } = useRecentDocuments()

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              {error instanceof Error
                ? error.message
                : 'Failed to load documents'}
            </p>
            <button
              onClick={() => {
                void refetch()
              }}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentListSkeleton />
        </CardContent>
      </Card>
    )
  }

  const documents = data?.documents || []

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No documents yet</p>
            <Link
              to="/documents/new"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Create your first document
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              to={`/documents/${doc.id}`}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Badge variant="outline" className="text-xs">
                  {DOCUMENT_TYPE_LABELS[doc.type]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {DOCUMENT_STATUS_LABELS[doc.status]}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
        {documents.length >= 10 && (
          <div className="mt-4 text-center">
            <Link
              to="/documents"
              className="text-sm text-primary hover:underline"
            >
              View all documents →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
