/**
 * Edit existing document.
 *
 * Loads via `useDocument`, hands a `DocumentInput` to the editor (totals
 * derived, not persisted to form state), and provides Print.
 *
 * Print: we render a hidden `<PrintView>` and call `window.print()`. The
 * print stylesheet (`index.css`) hides everything except `.print-area`.
 */

import { useNavigate, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { FullPageSpinner } from '@/components/feedback/FullPageSpinner'
import { DocumentEditor } from '@/features/documents/components/DocumentEditor'
import { PrintView } from '@/features/documents/components/PrintView'
import {
  useDocument,
  useUpdateDocument,
} from '@/features/documents/hooks'
import type { Document, DocumentInput } from '@/features/documents/types'

function toEditorInput(doc: Document): DocumentInput {
  return {
    type: doc.type,
    status: doc.status,
    number: doc.number ?? '',
    title: doc.title,
    description: doc.description ?? '',
    customer: doc.customer ?? { name: '', email: '', phone: '', address: '' },
    propertyId: doc.propertyId,
    propertyAddress: doc.propertyAddress ?? '',
    dueDate: doc.dueDate ?? '',
    paymentTerms: doc.paymentTerms ?? '',
    assignedTo: doc.assignedTo ?? '',
    tasks: doc.tasks ?? [],
    lineItems: doc.lineItems ?? [],
    taxRate: doc.taxRate,
    overheadRate: doc.overheadRate,
  }
}

export default function EditDocumentRoute() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useDocument(id)
  const update = useUpdateDocument(id)

  const initial = useMemo(
    () => (data ? toEditorInput(data) : null),
    [data]
  )

  if (isLoading) return <FullPageSpinner />
  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load document: {error.message}
      </div>
    )
  }
  if (!data || !initial) {
    return (
      <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">
        Document not found.
      </div>
    )
  }

  return (
    <>
      <DocumentEditor
        initial={initial}
        onSave={async (input) => {
          await update.mutateAsync(input)
        }}
        onCancel={() => navigate('/documents')}
        onPrint={() => window.print()}
        saving={update.isPending}
      />
      <div className="print-only">
        <PrintView doc={data} />
      </div>
    </>
  )
}
