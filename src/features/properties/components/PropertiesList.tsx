import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProperties, useDeleteProperty } from '../hooks'
import { PropertyBadge } from './PropertyBadge'
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  type PropertyType,
} from '../types'

export function PropertiesList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteHasUnits, setDeleteHasUnits] = useState(false)

  const { data: properties = [], isLoading } = useProperties({
    q: search,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const deleteMutation = useDeleteProperty()

  const handleDeleteClick = (id: string, unitCount: number) => {
    setDeleteId(id)
    setDeleteHasUnits(unitCount > 0)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null)
          setDeleteHasUnits(false)
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading properties...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as PropertyType | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {properties.length === 0 ? (
        <div className="flex h-64 items-center justify-center border rounded-lg">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium text-muted-foreground">
              No properties yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first property to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Units
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Occupancy
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Monthly Income
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {properties.map((property) => {
                  const { address } = property
                  const addressStr = `${address.street}, ${address.city}, ${address.state} ${address.zip}`

                  return (
                    <tr
                      key={property.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium">{addressStr}</span>
                      </td>
                      <td className="px-4 py-3">
                        <PropertyBadge type={property.type} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {property.ownerName || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm">
                          {property.unitCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm">
                          {property.unitCount > 0
                            ? `${Math.round(property.occupancyRate * 100)}%`
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium">
                          ${property.monthlyIncome.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(property.id, property.unitCount)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null)
            setDeleteHasUnits(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              {deleteHasUnits ? (
                <>
                  This property has units. Deleting it will also remove all
                  associated units. This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete this property? This action
                  cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteId(null)
                setDeleteHasUnits(false)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
