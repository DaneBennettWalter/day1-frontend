/**
 * Top-level error boundary.
 *
 * Catches any unhandled render-phase error and renders a recovery
 * surface so we never show a blank white screen. We log to console
 * (and any wired-up Sentry/console transport) — but never to the user.
 *
 * Note: error boundaries only catch render errors. Async errors are
 * handled by React Query's `onError` + the toast system.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  /** Optional custom fallback. */
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    if (this.props.fallback)
      return this.props.fallback(this.state.error, this.reset)
    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center"
      >
        <AlertTriangle
          className="h-10 w-10 text-destructive"
          aria-hidden="true"
        />
        <div>
          <h1 className="text-lg font-semibold">Something broke.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {this.state.error.message ||
              'An unexpected error occurred. Try refreshing.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={this.reset} variant="default">
            <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            Reload page
          </Button>
        </div>
      </div>
    )
  }
}
