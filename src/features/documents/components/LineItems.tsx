/**
 * Reusable line-items editor.
 *
 * Built on react-hook-form's `useFieldArray`. The parent form owns state;
 * we just render rows and dispatch field-level updates. Totals are computed
 * by the parent (or by a `<DocumentTotals>` sibling) reading the same form
 * values via `useWatch`.
 *
 * UX rules:
 *   - Add/remove rows inline.
 *   - Material/labor toggle per row (pill).
 *   - Quantity, unit price, taxable checkbox per row.
 *   - Auto-shown line total (computed, read-only).
 *   - Empty state has an "Add line" CTA.
 */

import { Plus, Trash2 } from 'lucide-react'
import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatCurrency, lineTotal } from '../calculations'
import type { DocumentInputForm } from '../schemas'

interface LineItemsProps {
  control: Control<DocumentInputForm>
  register: UseFormRegister<DocumentInputForm>
  errors?: FieldErrors<DocumentInputForm>
}

function newRow(): DocumentInputForm['lineItems'][number] {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `li-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    description: '',
    kind: 'material',
    quantity: 1,
    unitPrice: 0,
    taxable: true,
  }
}

export function LineItems({ control, register, errors }: LineItemsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
    keyName: '_key',
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Line items</h3>
          <p className="text-xs text-muted-foreground">
            Material vs labor split. Quantity × unit price. Tax applies per row.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => append(newRow())}
          className="h-8 px-3 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add line
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No line items yet.
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => append(newRow())}
              className="h-8 px-3 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add first line
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Kind</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit price</th>
                <th className="px-3 py-2 text-center">Tax</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <LineItemRow
                  key={field._key}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  onRemove={() => remove(index)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface RowProps {
  index: number
  control: Control<DocumentInputForm>
  register: UseFormRegister<DocumentInputForm>
  errors?: FieldErrors<DocumentInputForm>
  onRemove: () => void
}

function LineItemRow({ index, control, register, errors, onRemove }: RowProps) {
  const row = useWatch({ control, name: `lineItems.${index}` }) as
    | DocumentInputForm['lineItems'][number]
    | undefined
  const total = row
    ? lineTotal({
        quantity: Number(row.quantity) || 0,
        unitPrice: Number(row.unitPrice) || 0,
      })
    : 0

  const rowErrors = errors?.lineItems?.[index]

  return (
    <tr className="border-t align-top">
      <td className="px-3 py-2">
        <Input
          aria-label={`Description ${index + 1}`}
          placeholder="e.g. 12mm drywall sheet"
          {...register(`lineItems.${index}.description`)}
          className={cn(
            'h-9',
            rowErrors?.description &&
              'border-destructive focus:ring-destructive'
          )}
        />
        {rowErrors?.description ? (
          <p className="mt-1 text-xs text-destructive">
            {rowErrors.description.message}
          </p>
        ) : null}
      </td>
      <td className="px-3 py-2">
        <KindToggle index={index} control={control} register={register} />
      </td>
      <td className="px-3 py-2 text-right">
        <Input
          type="number"
          step="0.01"
          min="0"
          aria-label={`Quantity ${index + 1}`}
          className="h-9 w-24 text-right"
          {...register(`lineItems.${index}.quantity`)}
        />
      </td>
      <td className="px-3 py-2 text-right">
        <Input
          type="number"
          step="0.01"
          min="0"
          aria-label={`Unit price ${index + 1}`}
          className="h-9 w-28 text-right"
          {...register(`lineItems.${index}.unitPrice`)}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="checkbox"
          aria-label={`Taxable ${index + 1}`}
          className="h-4 w-4 rounded border-input"
          {...register(`lineItems.${index}.taxable`)}
        />
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatCurrency(total)}
      </td>
      <td className="px-2 py-2 text-right">
        <button
          type="button"
          aria-label={`Remove line ${index + 1}`}
          onClick={onRemove}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

function KindToggle({
  index,
  control,
  register,
}: {
  index: number
  control: Control<DocumentInputForm>
  register: UseFormRegister<DocumentInputForm>
}) {
  const value = useWatch({ control, name: `lineItems.${index}.kind` })
  return (
    <label className="inline-flex items-center gap-2 text-xs">
      <select
        {...register(`lineItems.${index}.kind`)}
        className="h-9 rounded-md border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
        aria-label={`Kind ${index + 1}`}
      >
        <option value="material">Material</option>
        <option value="labor">Labor</option>
      </select>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
          value === 'labor'
            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
        )}
      >
        {value === 'labor' ? 'Labor' : 'Material'}
      </span>
    </label>
  )
}
