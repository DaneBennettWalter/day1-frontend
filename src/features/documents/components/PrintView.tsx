/**
 * Print-only view of a document.
 *
 * Rendered offscreen (in a hidden `<div>`) by the edit route; visible only
 * when `window.print()` is called. The page's print stylesheet (defined in
 * `index.css`) hides the rest of the app and shows only `.print-area`.
 *
 * No PDF library here — modern browsers' "Save as PDF" from the print
 * dialog covers the requirement. A real PDF generator (pdfmake, puppeteer
 * server-side) can drop in later without changing this view.
 */

import {
  computeTotals,
  formatCurrency,
  formatPercent,
  lineTotal,
  splitByKind,
} from '../calculations'
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  type Document,
} from '../types'

export function PrintView({ doc }: { doc: Document }) {
  const totals = computeTotals({
    lineItems: doc.lineItems,
    taxRate: doc.taxRate,
    overheadRate: doc.overheadRate,
  })
  const split = splitByKind(doc.lineItems)

  return (
    <div className="print-area mx-auto max-w-[8.5in] bg-white p-10 text-black">
      <header className="flex items-start justify-between border-b border-black/20 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-black/60">
            {DOCUMENT_TYPE_LABELS[doc.type]}
          </div>
          <h1 className="mt-1 text-2xl font-semibold">
            {doc.title || DOCUMENT_TYPE_LABELS[doc.type]}
          </h1>
          {doc.number ? (
            <div className="mt-1 font-mono text-xs text-black/60">
              {doc.number}
            </div>
          ) : null}
        </div>
        <div className="text-right text-xs text-black/60">
          <div>Status: {DOCUMENT_STATUS_LABELS[doc.status]}</div>
          <div>Date: {formatDate(doc.updatedAt ?? doc.createdAt)}</div>
          {doc.dueDate ? <div>Due: {doc.dueDate}</div> : null}
        </div>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-6 text-sm">
        {doc.customer?.name ? (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-black/60">
              Customer
            </div>
            <div className="mt-1 font-medium">{doc.customer.name}</div>
            {doc.customer.email ? <div>{doc.customer.email}</div> : null}
            {doc.customer.phone ? <div>{doc.customer.phone}</div> : null}
            {doc.customer.address ? (
              <div className="whitespace-pre-line">{doc.customer.address}</div>
            ) : null}
          </div>
        ) : null}
        {doc.propertyAddress ? (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-black/60">
              Property
            </div>
            <div className="mt-1 whitespace-pre-line">
              {doc.propertyAddress}
            </div>
          </div>
        ) : null}
      </section>

      {doc.assignedTo ? (
        <section className="mt-5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-black/60">
            Assigned to:{' '}
          </span>
          {doc.assignedTo}
        </section>
      ) : null}

      {doc.tasks && doc.tasks.length > 0 ? (
        <section className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-black/60">
            Tasks
          </div>
          <ol className="mt-1 list-decimal pl-5 text-sm">
            {doc.tasks.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {doc.description ? (
        <section className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-black/60">
            Scope
          </div>
          <p className="mt-1 whitespace-pre-line text-sm">{doc.description}</p>
        </section>
      ) : null}

      <section className="mt-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-black/20 text-left text-xs uppercase tracking-wider text-black/60">
              <th className="py-2 pr-2">Description</th>
              <th className="py-2 px-2">Kind</th>
              <th className="py-2 px-2 text-right">Qty</th>
              <th className="py-2 px-2 text-right">Unit</th>
              <th className="py-2 pl-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {doc.lineItems.map((li) => (
              <tr key={li.id} className="border-b border-black/10 align-top">
                <td className="py-2 pr-2">{li.description}</td>
                <td className="py-2 px-2 capitalize">{li.kind}</td>
                <td className="py-2 px-2 text-right tabular-nums">
                  {li.quantity}
                </td>
                <td className="py-2 px-2 text-right tabular-nums">
                  {formatCurrency(li.unitPrice)}
                </td>
                <td className="py-2 pl-2 text-right tabular-nums">
                  {formatCurrency(lineTotal(li))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-6 text-sm">
        <div className="text-xs text-black/60">
          Materials: {formatCurrency(split.material)} \u00b7 Labor:{' '}
          {formatCurrency(split.labor)}
        </div>
        <div className="ml-auto w-full max-w-xs space-y-1 text-right">
          <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
          <Row
            label={`Tax (${formatPercent(doc.taxRate)})`}
            value={formatCurrency(totals.tax)}
          />
          <Row
            label={`Overhead (${formatPercent(doc.overheadRate)})`}
            value={formatCurrency(totals.overhead)}
          />
          <div className="border-t border-black/20 pt-1">
            <Row label="Total" value={formatCurrency(totals.total)} strong />
          </div>
        </div>
      </section>

      {doc.paymentTerms ? (
        <section className="mt-6 text-xs text-black/60">
          <span className="font-semibold">Payment terms: </span>
          {doc.paymentTerms}
        </section>
      ) : null}
    </div>
  )
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={strong ? 'text-sm font-semibold' : 'text-xs text-black/60'}
      >
        {label}
      </span>
      <span
        className={
          strong
            ? 'text-base font-semibold tabular-nums'
            : 'tabular-nums text-sm'
        }
      >
        {value}
      </span>
    </div>
  )
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}
