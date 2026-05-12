/**
 * Team settings tab (read-only placeholder)
 */
import { Users } from 'lucide-react'

export default function TeamSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Team Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage team access and permissions.
        </p>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Team Management Coming Soon
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Team invitations, role management, and permission controls will be
          available in a future update.
        </p>
      </div>
    </div>
  )
}
