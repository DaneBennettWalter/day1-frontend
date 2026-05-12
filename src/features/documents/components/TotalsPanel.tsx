/**
 * Live totals panel.
 *
 * Reads form values via `useWatch` and recomputes on every change. We don't
 * persist totals into the form — they're derived. The editor passes the
 * computed totals into the API payload at save time.
 *
 * Debounce: react-hook-form already coalesces watch updates; we additionally
 * memoize via React 18's auto-batching. For very large docs (>500 items)
 * we could useDeferredValue here, but P4 expects <100 lines per doc.
 */

import { useMemo } from 'react'
import { useWatch, type Control } from 'react-hook-form'
import { computeTotals, formatCurrency, formatPercent, splitByKind } from '../calculations'
import type { DocumentInputForm } from '../schemas'
import type { LineItem } from '../types'

export function TotalsPanel({ control }: { control: Control<DocumentInputForm> }) {
  const lineItems = useWatch({ control, name: 'lineItems' })
  const taxRate = useWatch({ control, name: 'taxRate' })
  const overheadRate = useWatch({ control, name: 'overheadRate' })

  const totals = useMemo(() => {
    const safeItems: LineItem[] = (lineItems ?? []).map((li) => ({
      id: li.id,
      description: li.description,
      kind: li.kind,
      quantity: Number(li.quantity) || 0,
      unitPrice: Number(li.unitPrice) || 0,
      taxable: !!li.taxable,
    }))
    return {
      ...computeTotals({
        lineItems: safeItems,
        taxRate: Number(taxRate) || 0,
        overheadRate: Number(overheadRate) || 0,
      }),
      split: splitByKind(safeItems),
    }
  }, [lineItems, taxRate, overheadRate])

  return (
    <div className="rounded-md border bg-card p-4 text-sm">
      <h3 className="mb-3 text-sm font-semibold">Totals</h3>
      <dl className="space-y-1.5">
        <Row label="Materials" value={formatCurrency(totals.split.material)} />
        <Row label="Labor" value={formatCurrency(totals.split.labor)} muted />
        <Divider />
        <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
        <Row
          label={`Tax (${formatPercent(Number(taxRate) || 0)} on taxable)`}
          value={formatCurrency(totals.tax)}
          muted
        />
        <Row
          label={`Overhead (${formatPercent(Number(overheadRate) || 0)})`}
          value={formatCurrency(totals.overhead)}
          muted
        />
        <Divider />
        <Row label="Total" value={formatCurrency(totals.total)} strong />
      </dl>
    </div>
  )
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string
  value: string
  muted?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <dt
        className={
          muted
            ? 'text-xs text-muted-foreground'
            : strong
              ? 'text-sm font-semibold'
              : 'text-sm'
        }
      >
        {label}
      </dt>
      <dd
        className={
          strong
            ? 'text-base font-semibold tabular-nums'
            : 'tabular-nums text-sm'
        }
      >
        {value}
      </dd>
    </div>
  )
}

function Divider() {
  return <div className="my-1.5 border-t" />
}
