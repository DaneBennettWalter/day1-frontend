import { useAuth } from '@/features/auth/hooks'

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back{user ? `, ${user.name}` : ''}.
        </p>
      </div>

      <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
        Widgets will live here in Phase 7.
      </div>
    </div>
  )
}
