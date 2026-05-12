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
import { propertyInputSchema, type PropertyFormData } from '../schemas'
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from '../types'
import type { Property } from '../types'
import { ContactPicker } from '@/features/contacts/components/ContactPicker'

interface PropertyFormProps {
  property?: Property
  onSubmit: (data: PropertyFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function PropertyForm({
  property,
  onSubmit,
  onCancel,
  isSubmitting,
}: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyInputSchema),
    defaultValues: property
      ? {
          address: property.address,
          type: property.type,
          ownerId: property.ownerId || undefined,
          purchaseDate: property.purchaseDate || '',
          purchasePrice: property.purchasePrice || undefined,
          currentValue: property.currentValue || undefined,
          notes: property.notes || '',
        }
      : {
          address: {
            street: '',
            city: '',
            state: '',
            zip: '',
          },
          type: 'residential',
          ownerId: undefined,
          purchaseDate: '',
          purchasePrice: undefined,
          currentValue: undefined,
          notes: '',
        },
  })

  const selectedType = watch('type')
  const selectedOwnerId = watch('ownerId')

  const handleFormSubmit = (rawData: unknown) => {
    // Normalize empty strings to undefined and convert numbers
    const data = rawData as PropertyFormData
    const normalized = {
      ...data,
      ownerId: data.ownerId || undefined,
      purchaseDate: data.purchaseDate || undefined,
      purchasePrice:
        data.purchasePrice !== undefined && data.purchasePrice !== null
          ? Number(data.purchasePrice)
          : undefined,
      currentValue:
        data.currentValue !== undefined && data.currentValue !== null
          ? Number(data.currentValue)
          : undefined,
      notes: data.notes?.trim() || undefined,
    }
    onSubmit(normalized)
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
      className="space-y-6"
    >
      {/* Address */}
      <div className="space-y-4">
        <Label>
          Address <span className="text-destructive">*</span>
        </Label>
        <div className="space-y-2">
          <Input
            {...register('address.street')}
            placeholder="Street"
            disabled={isSubmitting}
          />
          {errors.address?.street && (
            <p className="text-sm text-destructive">
              {errors.address.street.message}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                {...register('address.city')}
                placeholder="City"
                disabled={isSubmitting}
              />
              {errors.address?.city && (
                <p className="text-sm text-destructive">
                  {errors.address.city.message}
                </p>
              )}
            </div>
            <div>
              <Input
                {...register('address.state')}
                placeholder="State (TX)"
                maxLength={2}
                disabled={isSubmitting}
              />
              {errors.address?.state && (
                <p className="text-sm text-destructive">
                  {errors.address.state.message}
                </p>
              )}
            </div>
          </div>
          <Input
            {...register('address.zip')}
            placeholder="ZIP"
            disabled={isSubmitting}
          />
          {errors.address?.zip && (
            <p className="text-sm text-destructive">
              {errors.address.zip.message}
            </p>
          )}
        </div>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">
          Property Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedType}
          onValueChange={(value) =>
            setValue('type', value as PropertyFormData['type'])
          }
          disabled={isSubmitting}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* Owner */}
      <div className="space-y-2">
        <Label htmlFor="owner">Owner</Label>
        <ContactPicker
          value={selectedOwnerId}
          onChange={(contactId) => setValue('ownerId', contactId || undefined)}
          placeholder="Select owner..."
          disabled={isSubmitting}
        />
        {errors.ownerId && (
          <p className="text-sm text-destructive">{errors.ownerId.message}</p>
        )}
      </div>

      {/* Purchase Date */}
      <div className="space-y-2">
        <Label htmlFor="purchaseDate">Purchase Date</Label>
        <Input
          id="purchaseDate"
          type="date"
          {...register('purchaseDate')}
          disabled={isSubmitting}
        />
        {errors.purchaseDate && (
          <p className="text-sm text-destructive">
            {errors.purchaseDate.message}
          </p>
        )}
      </div>

      {/* Purchase Price */}
      <div className="space-y-2">
        <Label htmlFor="purchasePrice">Purchase Price</Label>
        <Input
          id="purchasePrice"
          type="number"
          step="0.01"
          {...register('purchasePrice')}
          placeholder="0.00"
          disabled={isSubmitting}
        />
        {errors.purchasePrice && (
          <p className="text-sm text-destructive">
            {errors.purchasePrice.message}
          </p>
        )}
      </div>

      {/* Current Value */}
      <div className="space-y-2">
        <Label htmlFor="currentValue">Current Value (Estimate)</Label>
        <Input
          id="currentValue"
          type="number"
          step="0.01"
          {...register('currentValue')}
          placeholder="0.00"
          disabled={isSubmitting}
        />
        {errors.currentValue && (
          <p className="text-sm text-destructive">
            {errors.currentValue.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional notes..."
          rows={4}
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
          {isSubmitting
            ? 'Saving...'
            : property
              ? 'Update Property'
              : 'Create Property'}
        </Button>
      </div>
    </form>
  )
}
