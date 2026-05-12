import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UnitForm } from './UnitForm'
import { useCreateUnit, useUpdateUnit } from '../hooks'
import type { Unit, UnitInput } from '../types'

interface UnitDialogProps {
  propertyId: string
  unit?: Unit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnitDialog({
  propertyId,
  unit,
  open,
  onOpenChange,
}: UnitDialogProps) {
  const createMutation = useCreateUnit(propertyId)
  const updateMutation = useUpdateUnit(unit?.id || '')

  const handleSubmit = (data: UnitInput) => {
    if (unit) {
      updateMutation.mutate(data, {
        onSuccess: () => onOpenChange(false),
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{unit ? 'Edit Unit' : 'Create Unit'}</DialogTitle>
        </DialogHeader>
        <UnitForm
          unit={unit}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
