/**
 * Upcoming Tasks Widget
 *
 * Displays work orders due in the next 7 days with status badges.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUpcomingTasks } from '../hooks'
import { DOCUMENT_STATUS_LABELS } from '@/features/documents/types'

function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 7) return `In ${diffDays} days`
  return date.toLocaleDateString()
}

export default function UpcomingTasks() {
  const { data, isLoading, isError, error, refetch } = useUpcomingTasks()

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              {error instanceof Error ? error.message : 'Failed to load tasks'}
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
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskListSkeleton />
        </CardContent>
      </Card>
    )
  }

  const tasks = data || []
  const tasksInNext7Days = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    const now = new Date()
    const diffDays = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    return diffDays >= -1 && diffDays <= 7 // Include overdue by 1 day
  })

  if (tasksInNext7Days.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No tasks due soon</p>
            <Link
              to="/documents/new?type=work_order"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Create a work order
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasksInNext7Days.slice(0, 10).map((task) => (
            <Link
              key={task.id}
              to={`/documents/${task.id}`}
              className="flex items-start justify-between p-2 rounded-md hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <div className="flex gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {formatDueDate(task.dueDate)}
                  </p>
                  {task.assignedTo && (
                    <p className="text-xs text-muted-foreground">
                      • {task.assignedTo}
                    </p>
                  )}
                </div>
                {task.propertyAddress && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {task.propertyAddress}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="text-xs ml-4">
                {DOCUMENT_STATUS_LABELS[
                  task.status as keyof typeof DOCUMENT_STATUS_LABELS
                ] || task.status}
              </Badge>
            </Link>
          ))}
        </div>
        {tasksInNext7Days.length > 10 && (
          <div className="mt-4 text-center">
            <Link
              to="/documents?type=work_order"
              className="text-sm text-primary hover:underline"
            >
              View all work orders →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
