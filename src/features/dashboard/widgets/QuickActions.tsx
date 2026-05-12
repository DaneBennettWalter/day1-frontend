/**
 * Quick Actions Widget
 *
 * Large action buttons for common tasks: create document, add property, add contact.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link to="/documents/new">
            <Button variant="outline" size="lg" className="w-full h-20">
              <div className="text-center">
                <div className="text-2xl mb-1">📄</div>
                <div className="text-sm font-semibold">Create Document</div>
              </div>
            </Button>
          </Link>
          <Link to="/properties/new">
            <Button variant="outline" size="lg" className="w-full h-20">
              <div className="text-center">
                <div className="text-2xl mb-1">🏢</div>
                <div className="text-sm font-semibold">Add Property</div>
              </div>
            </Button>
          </Link>
          <Link to="/contacts/new">
            <Button variant="outline" size="lg" className="w-full h-20">
              <div className="text-center">
                <div className="text-2xl mb-1">👤</div>
                <div className="text-sm font-semibold">Add Contact</div>
              </div>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
