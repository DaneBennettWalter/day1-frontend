import { Outlet } from 'react-router-dom'
import { RequireAuth } from '@/features/auth/guards'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { SkipLink } from './SkipLink'

export function AppShell() {
  return (
    <RequireAuth>
      <SkipLink />
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-auto p-6 focus:outline-none"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </RequireAuth>
  )
}
