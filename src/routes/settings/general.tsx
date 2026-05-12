/**
 * General/Company settings tab
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  generalSettingsSchema,
  type GeneralSettingsInput,
} from '@/features/settings/schemas'
import { useSettings, useUpdateSettings } from '@/features/settings/hooks'

export default function GeneralSettings() {
  const { data: settings, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      ein: '',
    },
  })

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      reset({
        name: settings.name || '',
        description: settings.description || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        ein: settings.ein || '',
      })
    }
  }, [settings, reset])

  const onSubmit = (data: GeneralSettingsInput) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        reset(data) // Mark form as pristine after save
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e)
      }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold mb-4">Company Information</h2>
        <div className="space-y-4">
          {/* Organization Name */}
          <div>
            <Label htmlFor="name" className="required">
              Organization Name
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Acme Construction"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of your organization..."
              rows={3}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="123 Main St, Suite 100&#10;Austin, TX 78701"
              rows={3}
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="(512) 555-0100"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@acme.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* EIN */}
          <div>
            <Label htmlFor="ein">EIN (Employer Identification Number)</Label>
            <Input
              id="ein"
              {...register('ein')}
              placeholder="12-3456789"
              aria-invalid={!!errors.ein}
            />
            {errors.ein && (
              <p className="text-sm text-destructive mt-1">
                {errors.ein.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
          {updateMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
