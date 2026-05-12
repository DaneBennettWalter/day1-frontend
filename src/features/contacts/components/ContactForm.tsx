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
import {
  contactInputSchema,
  normalizeContactInput,
  type ContactFormData,
} from '../schemas'
import { CONTACT_TYPES, CONTACT_TYPE_LABELS } from '../types'
import type { Contact } from '../types'

interface ContactFormProps {
  contact?: Contact
  onSubmit: (data: ContactFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ContactForm({
  contact,
  onSubmit,
  onCancel,
  isSubmitting,
}: ContactFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactInputSchema),
    defaultValues: contact
      ? {
          name: contact.name,
          email: contact.email || '',
          phone: contact.phone || '',
          type: contact.type,
          company: contact.company || '',
          address: contact.address || {
            street: '',
            city: '',
            state: '',
            zip: '',
          },
          notes: contact.notes || '',
        }
      : {
          name: '',
          email: '',
          phone: '',
          type: 'customer',
          company: '',
          address: {
            street: '',
            city: '',
            state: '',
            zip: '',
          },
          notes: '',
        },
  })

  const selectedType = watch('type')

  const handleFormSubmit = (data: ContactFormData) => {
    onSubmit(normalizeContactInput(data))
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
      className="space-y-6"
    >
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="John Doe"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">
          Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedType}
          onValueChange={(value) =>
            setValue('type', value as ContactFormData['type'])
          }
          disabled={isSubmitting}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {CONTACT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="john@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="(555) 123-4567"
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          {...register('company')}
          placeholder="Acme Corp"
          disabled={isSubmitting}
        />
        {errors.company && (
          <p className="text-sm text-destructive">{errors.company.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-4">
        <Label>Address</Label>
        <div className="space-y-2">
          <Input
            {...register('address.street')}
            placeholder="Street"
            disabled={isSubmitting}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              {...register('address.city')}
              placeholder="City"
              disabled={isSubmitting}
            />
            <Input
              {...register('address.state')}
              placeholder="State"
              disabled={isSubmitting}
            />
          </div>
          <Input
            {...register('address.zip')}
            placeholder="ZIP"
            disabled={isSubmitting}
          />
        </div>
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
            : contact
              ? 'Update Contact'
              : 'Create Contact'}
        </Button>
      </div>
    </form>
  )
}
