import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  to: string
  icon: typeof LayoutDashboard
  enabled: boolean
}

const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    enabled: true,
  },
  { label: 'Documents', to: '/documents', icon: FileText, enabled: false },
  { label: 'Contacts', to: '/contacts', icon: Users, enabled: false },
  { label: 'Properties', to: '/properties', icon: Building2, enabled: false },
  { label: 'Settings', to: '/settings', icon: Settings, enabled: true },
]

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center px-6 text-lg font-semibold">
        day1
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          if (!item.enabled) {
            return (
              <span
                key={item.to}
                aria-disabled="true"
                title="Coming soon"
                className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/60"
              >
                <Icon className="h-4 w-4" />
                {item.label}
                <span className="ml-auto text-[10px] uppercase tracking-wider">
                  Soon
                </span>
              </span>
            )
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-foreground hover:bg-secondary/60'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
