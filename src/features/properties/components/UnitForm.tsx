import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { unitInputSchema, type UnitFormData } from '../schemas'
import { UNIT_STATUSES, UNIT_STATUS_LABELS } from '../types'
import type { Unit } from '../types'
import { ContactPicker } from '@/features/contacts/components/ContactPicker'

interface UnitFormProps {
  unit?: Unit
  onSubmit: (data: UnitFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function UnitForm({
  unit,
  onSubmit,
  onCancel,
  isSubmitting,
}: UnitFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitInputSchema),
    defaultValues: unit
      ? {
          unitNumber: unit.unitNumber,
          bedrooms: unit.bedrooms || undefined,
          bathrooms: unit.bathrooms || undefined,
          squareFeet: unit.squareFeet || undefined,
          rentAmount: unit.rentAmount || undefined,
          tenantId: unit.tenantId || undefined,
          leaseStart: unit.leaseStart || '',
          leaseEnd: unit.leaseEnd || '',
          status: unit.status,
          notes: unit.notes || '',
        }
      : {
          unitNumber: '',
          bedrooms: undefined,
          bathrooms: undefined,
          squareFeet: undefined,
          rentAmount: undefined,
          tenantId: undefined,
          leaseStart: '',
          leaseEnd: '',
          status: 'vacant',
          notes: '',
        },
  })

  const selectedStatus = watch('status')
  const selectedTenantId = watch('tenantId')

  const handleFormSubmit = (rawData: unknown) => {
    // Normalize empty strings to undefined and convert numbers
    const data = rawData as UnitFormData
    const normalized = {
      ...data,
      bedrooms:
        data.bedrooms !== undefined && data.bedrooms !== null
          ? Number(data.bedrooms)
          : undefined,
      bathrooms:
        data.bathrooms !== undefined && data.bathrooms !== null
          ? Number(data.bathrooms)
          : undefined,
      squareFeet:
        data.squareFeet !== undefined && data.squareFeet !== null
          ? Number(data.squareFeet)
          : undefined,
      rentAmount:
        data.rentAmount !== undefined && data.rentAmount !== null
          ? Number(data.rentAmount)
          : undefined,
      tenantId: data.tenantId || undefined,
      leaseStart: data.leaseStart || undefined,
      leaseEnd: data.leaseEnd || undefined,
      notes: data.notes?.trim() || undefined,
    }
    onSubmit(normalized)
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
      className="space-y-6"
    >
      {/* Unit Number */}
      <div className="space-y-2">
        <Label htmlFor="unitNumber">
          Unit Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="unitNumber"
          {...register('unitNumber')}
          placeholder="101, A, etc."
          disabled={isSubmitting}
        />
        {errors.unitNumber && (
          <p className="text-sm text-destructive">
            {errors.unitNumber.message}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedStatus}
          onValueChange={(value) =>
            setValue('status', value as UnitFormData['status'])
          }
          disabled={isSubmitting}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {UNIT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {UNIT_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            step="1"
            {...register('bedrooms')}
            placeholder="2"
            disabled={isSubmitting}
          />
          {errors.bedrooms && (
            <p className="text-sm text-destructive">
              {errors.bedrooms.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            step="0.5"
            {...register('bathrooms')}
            placeholder="1.5"
            disabled={isSubmitting}
          />
          {errors.bathrooms && (
            <p className="text-sm text-destructive">
              {errors.bathrooms.message}
            </p>
          )}
        </div>
      </div>

      {/* Square Feet */}
      <div className="space-y-2">
        <Label htmlFor="squareFeet">Square Feet</Label>
        <Input
          id="squareFeet"
          type="number"
          step="1"
          {...register('squareFeet')}
          placeholder="1200"
          disabled={isSubmitting}
        />
        {errors.squareFeet && (
          <p className="text-sm text-destructive">
            {errors.squareFeet.message}
          </p>
        )}
      </div>

      {/* Rent Amount */}
      <div className="space-y-2">
        <Label htmlFor="rentAmount">Monthly Rent</Label>
        <Input
          id="rentAmount"
          type="number"
          step="0.01"
          {...register('rentAmount')}
          placeholder="1500.00"
          disabled={isSubmitting}
        />
        {errors.rentAmount && (
          <p className="text-sm text-destructive">
            {errors.rentAmount.message}
          </p>
        )}
      </div>

      {/* Tenant */}
      <div className="space-y-2">
        <Label htmlFor="tenant">Tenant</Label>
        <ContactPicker
          value={selectedTenantId}
          onChange={(contactId) => setValue('tenantId', contactId || undefined)}
          placeholder="Select tenant..."
          disabled={isSubmitting}
        />
        {errors.tenantId && (
          <p className="text-sm text-destructive">{errors.tenantId.message}</p>
        )}
      </div>

      {/* Lease Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="leaseStart">Lease Start</Label>
          <Input
            id="leaseStart"
            type="date"
            {...register('leaseStart')}
            disabled={isSubmitting}
          />
          {errors.leaseStart && (
            <p className="text-sm text-destructive">
              {errors.leaseStart.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaseEnd">Lease End</Label>
          <Input
            id="leaseEnd"
            type="date"
            {...register('leaseEnd')}
            disabled={isSubmitting}
          />
          {errors.leaseEnd && (
            <p className="text-sm text-destructive">
              {errors.leaseEnd.message}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional notes..."
          rows={3}
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : unit ? 'Update Unit' : 'Create Unit'}
        </Button>
      </div>
    </form>
  )
}
