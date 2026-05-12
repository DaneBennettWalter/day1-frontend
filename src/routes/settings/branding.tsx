/**
 * Branding settings tab
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  brandingSettingsSchema,
  type BrandingSettingsInput,
} from '@/features/settings/schemas'
import { useSettings, useUpdateSettings } from '@/features/settings/hooks'

export default function BrandingSettings() {
  const { data: settings, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<BrandingSettingsInput>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: {
      logoUrl: '',
      primaryColor: '#3b82f6',
      accentColor: '#10b981',
      theme: 'system',
    },
  })

  const primaryColor = watch('primaryColor')
  const accentColor = watch('accentColor')
  const theme = watch('theme')

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      reset({
        logoUrl: settings.logoUrl || '',
        primaryColor: settings.primaryColor || '#3b82f6',
        accentColor: settings.accentColor || '#10b981',
        theme: settings.theme || 'system',
      })
    }
  }, [settings, reset])

  // Apply theme changes immediately for preview
  useEffect(() => {
    if (!theme) return
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [theme])

  // Apply color changes immediately for preview
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor)
    }
  }, [primaryColor])

  useEffect(() => {
    if (accentColor) {
      document.documentElement.style.setProperty('--accent', accentColor)
    }
  }, [accentColor])

  const onSubmit = (data: BrandingSettingsInput) => {
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
        <h2 className="text-lg font-semibold mb-4">Branding & Appearance</h2>
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={theme}
              onValueChange={(value) =>
                setValue('theme', value as 'light' | 'dark' | 'system', {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Changes apply immediately
            </p>
          </div>

          {/* Primary Color */}
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-3 mt-1">
              <input
                id="primaryColor"
                type="color"
                {...register('primaryColor')}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <Input
                type="text"
                value={primaryColor || ''}
                onChange={(e) =>
                  setValue('primaryColor', e.target.value, {
                    shouldDirty: true,
                  })
                }
                placeholder="#3b82f6"
                className="flex-1"
                aria-invalid={!!errors.primaryColor}
              />
            </div>
            {errors.primaryColor && (
              <p className="text-sm text-destructive mt-1">
                {errors.primaryColor.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Used for buttons, links, and accents
            </p>
          </div>

          {/* Accent Color */}
          <div>
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center gap-3 mt-1">
              <input
                id="accentColor"
                type="color"
                {...register('accentColor')}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <Input
                type="text"
                value={accentColor || ''}
                onChange={(e) =>
                  setValue('accentColor', e.target.value, { shouldDirty: true })
                }
                placeholder="#10b981"
                className="flex-1"
                aria-invalid={!!errors.accentColor}
              />
            </div>
            {errors.accentColor && (
              <p className="text-sm text-destructive mt-1">
                {errors.accentColor.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Used for success states and highlights
            </p>
          </div>

          {/* Logo Upload Placeholder */}
          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              type="url"
              {...register('logoUrl')}
              placeholder="https://example.com/logo.png"
              aria-invalid={!!errors.logoUrl}
            />
            {errors.logoUrl && (
              <p className="text-sm text-destructive mt-1">
                {errors.logoUrl.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Logo upload feature coming soon. For now, provide a URL.
            </p>
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
