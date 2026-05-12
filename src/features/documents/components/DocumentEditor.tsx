/**
 * Document editor.
 *
 * One form, type-driven sections. The five shipped types differ in which
 * meta-fields show up:
 *   - bid / estimate / proposal: scope description, customer
 *   - invoice: payment terms, due date, customer
 *   - work_order: assigned-to, tasks list
 *
 * All types share: line items, tax/overhead, status, totals.
 *
 * Unsaved-changes guard: `beforeunload` warns on browser close; in-app
 * navigation guard is opt-in via the parent route's `<Prompt>` equivalent.
 * We also expose `formState.isDirty` so the route can wire its own guard.
 *
 * Calculations panel reads form state live; debouncing happens via
 * react-hook-form's batched updates + React 18 auto-batching. No throttle
 * needed below a few hundred line items.
 */

import { useEffect, useState } from 'react'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Printer, Save, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ContactPicker } from '@/features/contacts/components/ContactPicker'
import { useContact } from '@/features/contacts/hooks'
import {
  documentInputSchema,
  type DocumentInputForm,
  type DocumentInputParsed,
} from '../schemas'
import {
  DOCUMENT_STATUSES,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  SHIPPED_TYPES,
  type DocumentInput,
  type DocumentType,
} from '../types'
import { LineItems } from './LineItems'
import { TotalsPanel } from './TotalsPanel'
import { AiGenerateModal } from './AiGenerateModal'

export interface DocumentEditorProps {
  /** Initial values; the editor merges these on top of the blank defaults. */
  initial: DocumentInput
  /** True when this is a new document (affects AI button + title). */
  isNew?: boolean
  onSave: (input: DocumentInput) => void | Promise<void>
  onCancel: () => void
  onPrint?: () => void
  saving?: boolean
}

export function DocumentEditor({
  initial,
  isNew = false,
  onSave,
  onCancel,
  onPrint,
  saving = false,
}: DocumentEditorProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
    formState,
  } = useForm<DocumentInputForm, unknown, DocumentInputParsed>({
    resolver: zodResolver(documentInputSchema),
    defaultValues: initial as DocumentInputForm,
    mode: 'onBlur',
  })

  const type = watch('type') as DocumentType

  // beforeunload guard for browser close / refresh.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!formState.isDirty || saving) return
      e.preventDefault()
      // Modern browsers ignore custom strings, but setting returnValue is
      // required to actually trigger the prompt in Chromium.
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [formState.isDirty, saving])

  const [aiOpen, setAiOpen] = useState(false)

  const submit: SubmitHandler<DocumentInputParsed> = (parsed) => {
    // The Zod resolver hands us a fully-coerced object that satisfies
    // DocumentInput's required shape minus totals (computed server-side).
    void onSave(parsed as DocumentInput)
  }

  function applyAiPatch(patch: Partial<DocumentInput>) {
    const current = getValues()
    // Merge — never blow away user-edited fields with empties.
    const next: DocumentInputForm = {
      ...current,
      ...patch,
      customer: patch.customer
        ? { ...current.customer, ...patch.customer }
        : current.customer,
      lineItems: patch.lineItems ?? current.lineItems,
      tasks: patch.tasks ?? current.tasks,
    } as DocumentInputForm
    reset(next, { keepDirty: true, keepTouched: true })
  }

  const typeLabel = DOCUMENT_TYPE_LABELS[type] ?? 'Document'

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(submit)(e)
      }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew ? `New ${typeLabel}` : typeLabel}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isNew ? 'Draft a new document.' : 'Edit document details.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {isNew ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAiOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          ) : null}
          {onPrint ? (
            <Button type="button" variant="outline" onClick={onPrint}>
              <Printer className="h-4 w-4" />
              Print / PDF
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving\u2026' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Meta */}
          <section className="space-y-4 rounded-md border bg-card p-5">
            <h2 className="text-sm font-semibold">Details</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Type" error={formState.errors.type?.message}>
                <select
                  {...register('type')}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  disabled={!isNew}
                >
                  {SHIPPED_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {DOCUMENT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status" error={formState.errors.status?.message}>
                <select
                  {...register('status')}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {DOCUMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {DOCUMENT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Number" error={formState.errors.number?.message}>
                <Input
                  {...register('number')}
                  placeholder="e.g. BID-001"
                  className="h-9"
                />
              </Field>
            </div>

            <Field label="Title" error={formState.errors.title?.message}>
              <Input
                {...register('title')}
                placeholder="Short, scannable label"
                className="h-9"
              />
            </Field>

            {/* Type-specific meta */}
            <TypeSpecificFields
              type={type}
              register={register}
              control={control}
              errors={formState.errors}
            />

            <Field
              label="Description"
              error={formState.errors.description?.message}
              hint="Scope of work, notes, fine print. Shows on the printed document."
            >
              <Textarea
                {...register('description')}
                rows={4}
                placeholder="Scope of work\u2026"
              />
            </Field>
          </section>

          {/* Customer */}
          <section className="space-y-4 rounded-md border bg-card p-5">
            <h2 className="text-sm font-semibold">Customer & property</h2>
            <CustomerContactPicker
              setValue={(name, email, phone, address) => {
                reset(
                  {
                    ...getValues(),
                    customer: { name, email, phone, address },
                  },
                  { keepDirty: true }
                )
              }}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field
                label="Customer name"
                error={formState.errors.customer?.name?.message}
              >
                <Input {...register('customer.name')} className="h-9" />
              </Field>
              <Field
                label="Customer email"
                error={formState.errors.customer?.email?.message}
              >
                <Input
                  type="email"
                  {...register('customer.email')}
                  className="h-9"
                />
              </Field>
              <Field
                label="Customer phone"
                error={formState.errors.customer?.phone?.message}
              >
                <Input {...register('customer.phone')} className="h-9" />
              </Field>
              <Field
                label="Customer address"
                error={formState.errors.customer?.address?.message}
              >
                <Input {...register('customer.address')} className="h-9" />
              </Field>
              <Field
                label="Property address"
                error={formState.errors.propertyAddress?.message}
              >
                <Input {...register('propertyAddress')} className="h-9" />
              </Field>
            </div>
          </section>

          {/* Line items */}
          <section className="space-y-4 rounded-md border bg-card p-5">
            <LineItems
              control={control}
              register={register}
              errors={formState.errors}
            />

            <div className="grid grid-cols-2 gap-3 border-t pt-4 md:max-w-md">
              <Field
                label="Tax rate (decimal)"
                error={formState.errors.taxRate?.message}
                hint="e.g. 0.0825 = 8.25%"
              >
                <Input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  {...register('taxRate')}
                  className="h-9"
                />
              </Field>
              <Field
                label="Overhead rate (decimal)"
                error={formState.errors.overheadRate?.message}
                hint="e.g. 0.10 = 10%"
              >
                <Input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  {...register('overheadRate')}
                  className="h-9"
                />
              </Field>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start print:hidden">
          <TotalsPanel control={control} />
          {formState.isDirty ? (
            <p className="text-xs text-muted-foreground">
              You have unsaved changes.
            </p>
          ) : null}
        </aside>
      </div>

      <AiGenerateModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        initialType={type}
        onApply={applyAiPatch}
      />
    </form>
  )
}

interface FieldProps {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

interface TypeSpecificProps {
  type: DocumentType
  register: ReturnType<typeof useForm<DocumentInputForm>>['register']
  control: ReturnType<typeof useForm<DocumentInputForm>>['control']
  errors: ReturnType<typeof useForm<DocumentInputForm>>['formState']['errors']
}

function TypeSpecificFields({
  type,
  register,
  control,
  errors,
}: TypeSpecificProps) {
  if (type === 'invoice') {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Due date" error={errors.dueDate?.message}>
          <Input type="date" {...register('dueDate')} className="h-9" />
        </Field>
        <Field label="Payment terms" error={errors.paymentTerms?.message}>
          <Input
            {...register('paymentTerms')}
            placeholder="Net 30"
            className="h-9"
          />
        </Field>
      </div>
    )
  }

  if (type === 'work_order') {
    return (
      <div className={cn('grid grid-cols-1 gap-3')}>
        <Field label="Assigned to" error={errors.assignedTo?.message}>
          <Input
            {...register('assignedTo')}
            placeholder="Crew member or vendor"
            className="h-9"
          />
        </Field>
        <TasksField control={control} />
      </div>
    )
  }

  return null
}

function TasksField({
  control,
}: {
  control: ReturnType<typeof useForm<DocumentInputForm>>['control']
}) {
  // Tasks is a string[] in the schema; users type them in a textarea.
  // Controller adapts the \n-joined string ↔ string[] mapping cleanly.
  return (
    <Field label="Tasks" hint="One task per line.">
      <Controller
        control={control}
        name="tasks"
        render={({ field }) => (
          <Textarea
            rows={4}
            placeholder="Demo old cabinets\nInstall new uppers…"
            value={(field.value ?? []).join('\n')}
            onChange={(e) =>
              field.onChange(
                e.target.value.split('\n').map((s) => s)
                // Preserve user blank lines while typing; trim+filter happens at save.
              )
            }
            onBlur={() => {
              const cleaned = (field.value ?? [])
                .map((s) => s.trim())
                .filter(Boolean)
              field.onChange(cleaned)
              field.onBlur()
            }}
          />
        )}
      />
    </Field>
  )
}

function CustomerContactPicker({
  setValue,
}: {
  setValue: (
    name: string,
    email?: string,
    phone?: string,
    address?: string
  ) => void
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const { data: contact } = useContact(selectedId ?? '')

  useEffect(() => {
    if (contact) {
      const address = contact.address
        ? [
            contact.address.street,
            contact.address.city,
            contact.address.state,
            contact.address.zip,
          ]
            .filter(Boolean)
            .join(', ')
        : undefined
      setValue(contact.name, contact.email, contact.phone, address)
    }
  }, [contact, setValue])

  return (
    <Field label="Quick-fill from contact">
      <ContactPicker
        value={selectedId}
        onChange={setSelectedId}
        placeholder="Select a contact to auto-fill customer fields..."
      />
    </Field>
  )
}
