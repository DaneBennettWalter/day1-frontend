import { LogOut } from 'lucide-react'
import { useAuth, useLogout } from '@/features/auth/hooks'

export function TopBar() {
  const { user } = useAuth()
  const logout = useLogout()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="text-sm text-muted-foreground">
        {user ? `Signed in as ${user.email}` : ''}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{user?.displayName}</span>
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-secondary/60"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </header>
  )
}
