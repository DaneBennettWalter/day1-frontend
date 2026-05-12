/**
 * 404 page. Used for any unmatched route.
 *
 * Replaces the old "navigate to /dashboard" silent redirect, because
 * silent redirects mask broken links. Users should know they hit a
 * dead URL.
 */

import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFoundRoute() {
  return (
    <main
      role="main"
      className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <FileQuestion
        className="h-12 w-12 text-muted-foreground"
        aria-hidden="true"
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          to="/dashboard"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to dashboard
        </Link>
        <Link
          to="/chat"
          className="inline-flex items-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open chat
        </Link>
      </div>
    </main>
  )
}
