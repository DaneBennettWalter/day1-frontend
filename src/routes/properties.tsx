import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PropertiesList } from '@/features/properties/components/PropertiesList'
import { PropertyForm } from '@/features/properties/components/PropertyForm'
import { useCreateProperty } from '@/features/properties/hooks'
import type { PropertyFormData } from '@/features/properties/schemas'

export function PropertiesPage() {
  const navigate = useNavigate()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const createMutation = useCreateProperty()

  const handleCreate = (data: PropertyFormData) => {
    createMutation.mutate(data, {
      onSuccess: (property) => {
        setShowCreateDialog(false)
        navigate(`/properties/${property.id}`)
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage your property portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/properties/rent-roll')}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Rent Roll
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Property
          </Button>
        </div>
      </div>

      {/* List */}
      <PropertiesList />

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Property</DialogTitle>
          </DialogHeader>
          <PropertyForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
