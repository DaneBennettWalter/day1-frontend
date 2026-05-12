import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useProperty,
  useUpdateProperty,
  useUnits,
  useDeleteUnit,
} from '../hooks'
import { PropertyBadge } from './PropertyBadge'
import { PropertyForm } from './PropertyForm'
import { UnitStatusBadge } from './UnitStatusBadge'
import { UnitDialog } from './UnitDialog'
import type { PropertyFormData } from '../schemas'
import type { Unit } from '../types'

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isCreatingUnit, setIsCreatingUnit] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null)

  const { data: property, isLoading: propertyLoading } = useProperty(id)
  const { data: units = [], isLoading: unitsLoading } = useUnits(id)
  const updateMutation = useUpdateProperty(id!)
  const deleteUnitMutation = useDeleteUnit()

  const handleUpdate = (data: PropertyFormData) => {
    updateMutation.mutate(data, {
      onSuccess: () => setIsEditing(false),
    })
  }

  const handleDeleteUnit = () => {
    if (deleteUnitId) {
      deleteUnitMutation.mutate(deleteUnitId, {
        onSuccess: () => setDeleteUnitId(null),
      })
    }
  }

  if (propertyLoading || unitsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading property...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Property not found
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/properties')}
            className="mt-4"
          >
            Back to Properties
          </Button>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <h1 className="text-2xl font-bold">Edit Property</h1>
        </div>
        <div className="border rounded-lg p-6">
          <PropertyForm
            property={property}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isSubmitting={updateMutation.isPending}
          />
        </div>
      </div>
    )
  }

  const { address } = property
  const addressStr = `${address.street}, ${address.city}, ${address.state} ${address.zip}`

  const occupiedCount = units.filter((u) => u.status === 'occupied').length
  const occupancyRate =
    units.length > 0 ? (occupiedCount / units.length) * 100 : 0
  const monthlyIncome = units
    .filter((u) => u.status === 'occupied' && u.rentAmount)
    .reduce((sum, u) => sum + (u.rentAmount || 0), 0)

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/properties')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{addressStr}</h1>
            <div className="mt-2">
              <PropertyBadge type={property.type} />
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Property Details */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Property Information</h2>

          {property.ownerName && (
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">{property.ownerName}</p>
            </div>
          )}

          {property.purchaseDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Purchase Date</p>
                <p className="font-medium">
                  {new Date(property.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {property.purchasePrice !== undefined && (
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Purchase Price</p>
                <p className="font-medium">
                  ${property.purchasePrice.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {property.currentValue !== undefined && (
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Current Value (Est.)
                </p>
                <p className="font-medium">
                  ${property.currentValue.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {property.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Notes</p>
              <p className="whitespace-pre-wrap text-sm">{property.notes}</p>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Portfolio Stats</h2>

          <div>
            <p className="text-sm text-muted-foreground">Total Units</p>
            <p className="text-2xl font-bold">{units.length}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Occupancy Rate</p>
            <p className="text-2xl font-bold">
              {units.length > 0 ? `${Math.round(occupancyRate)}%` : '—'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {occupiedCount} occupied · {units.length - occupiedCount} vacant
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Monthly Income</p>
            <p className="text-2xl font-bold">
              ${monthlyIncome.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Units Section */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Units</h2>
          <Button onClick={() => setIsCreatingUnit(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </div>

        {units.length === 0 ? (
          <div className="flex h-32 items-center justify-center border rounded-lg">
            <p className="text-muted-foreground">
              No units yet. Add your first unit to get started.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Beds/Baths
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Sq Ft
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Rent
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Tenant
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Lease End
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {units.map((unit) => (
                    <tr
                      key={unit.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => setEditingUnit(unit)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium">{unit.unitNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <UnitStatusBadge status={unit.status} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {unit.bedrooms !== undefined ||
                        unit.bathrooms !== undefined
                          ? `${unit.bedrooms || 0}/${unit.bathrooms || 0}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {unit.squareFeet?.toLocaleString() || '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {unit.rentAmount
                          ? `$${unit.rentAmount.toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {unit.tenantName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {unit.leaseEnd
                          ? new Date(unit.leaseEnd).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteUnitId(unit.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Unit Dialog */}
      <UnitDialog
        propertyId={id!}
        open={isCreatingUnit}
        onOpenChange={setIsCreatingUnit}
      />

      {/* Edit Unit Dialog */}
      <UnitDialog
        propertyId={id!}
        unit={editingUnit || undefined}
        open={!!editingUnit}
        onOpenChange={(open) => !open && setEditingUnit(null)}
      />

      {/* Delete Unit Confirmation */}
      <Dialog
        open={!!deleteUnitId}
        onOpenChange={(open) => !open && setDeleteUnitId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this unit? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUnitId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUnit}
              disabled={deleteUnitMutation.isPending}
            >
              {deleteUnitMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
