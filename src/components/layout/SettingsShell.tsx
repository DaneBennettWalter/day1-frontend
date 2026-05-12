/**
 * Settings layout shell with tabs
 */
import { Link, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'general', label: 'General', path: '/settings/general' },
  { id: 'ai', label: 'AI', path: '/settings/ai' },
  { id: 'branding', label: 'Branding', path: '/settings/branding' },
  { id: 'team', label: 'Team', path: '/settings/team' },
]

export function SettingsShell() {
  const location = useLocation()

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your organization and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={cn(
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-card rounded-lg border p-6">
        <Outlet />
      </div>
    </div>
  )
}
