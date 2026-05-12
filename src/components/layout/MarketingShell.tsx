import { Outlet } from 'react-router-dom'
import { RedirectIfAuthed } from '@/features/auth/guards'

export function MarketingShell() {
  return (
    <RedirectIfAuthed>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex h-16 items-center border-b bg-card px-6">
          <span className="text-lg font-semibold">day1</span>
        </header>
        <main className="flex flex-1 items-center justify-center p-6">
          <Outlet />
        </main>
      </div>
    </RedirectIfAuthed>
  )
}
