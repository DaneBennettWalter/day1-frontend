/**
 * AI settings tab
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  aiSettingsSchema,
  type AiSettingsInput,
} from '@/features/settings/schemas'
import { useHealthCheck, useSaveApiKey } from '@/features/settings/hooks'

export default function AiSettings() {
  const { data: health, isLoading: healthLoading } = useHealthCheck()
  const saveKeyMutation = useSaveApiKey()
  const [showKeyInput, setShowKeyInput] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AiSettingsInput>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      apiKey: '',
    },
  })

  const onSubmit = (data: AiSettingsInput) => {
    if (!data.apiKey) return

    saveKeyMutation.mutate(data.apiKey, {
      onSuccess: () => {
        reset() // Clear the input
        setShowKeyInput(false)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">AI Integration</h2>
        <p className="text-sm text-muted-foreground">
          Configure AI capabilities for estimate generation and document
          assistance.
        </p>
      </div>

      {/* AI Status Badge */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {healthLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : health?.hasAI ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <div>
              <p className="font-medium">
                {healthLoading
                  ? 'Checking AI status...'
                  : health?.hasAI
                    ? 'AI Active'
                    : 'AI Unavailable'}
              </p>
              <p className="text-sm text-muted-foreground">
                {healthLoading
                  ? 'Please wait...'
                  : health?.hasAI
                    ? 'AI features are enabled and working'
                    : 'AI features require an API key to function'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      {!health?.hasAI && !healthLoading && (
        <div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                  API Key Required
                </p>
                <p className="text-amber-800 dark:text-amber-300">
                  To use AI features, you need to provide an Anthropic API key.
                  Get one from{' '}
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {!showKeyInput ? (
            <Button onClick={() => setShowKeyInput(true)} variant="outline">
              Add API Key
            </Button>
          ) : (
            <form
              onSubmit={(e) => {
                void handleSubmit(onSubmit)(e)
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="apiKey">Anthropic API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  {...register('apiKey')}
                  placeholder="sk-ant-api03-..."
                  aria-invalid={!!errors.apiKey}
                />
                {errors.apiKey && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.apiKey.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Keys are encrypted server-side and never stored in your
                  browser
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saveKeyMutation.isPending}>
                  {saveKeyMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save API Key
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowKeyInput(false)
                    reset()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* When AI is active */}
      {health?.hasAI && !healthLoading && (
        <div>
          <h3 className="text-sm font-medium mb-2">API Key Status</h3>
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>API key configured and active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
