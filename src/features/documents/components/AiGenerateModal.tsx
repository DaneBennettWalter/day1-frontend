/**
 * AI document generator.
 *
 * The user describes what they want; we POST to `/api/ai/generate`, parse the
 * loosely-typed response with `parseAiDocument`, and hand a
 * `Partial<DocumentInput>` back to the editor via `onApply`.
 *
 * The editor merges the partial over its current defaults — it does NOT blow
 * away unrelated fields. User can edit before saving. No auto-save here.
 */

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { useGenerateAiDocument } from '../hooks'
import type { DocumentInput, DocumentType, ShippedDocumentType } from '../types'
import { SHIPPED_TYPES, DOCUMENT_TYPE_LABELS } from '../types'

interface AiGenerateModalProps {
  open: boolean
  onClose: () => void
  initialType?: DocumentType
  onApply: (patch: Partial<DocumentInput>) => void
}

const EXAMPLES: Record<ShippedDocumentType, string> = {
  bid: 'Bid for a 200 sqft bathroom remodel: new tile, vanity, toilet, paint. South Texas labor rates.',
  invoice:
    'Invoice for last week\u2019s drywall repair at 412 Oak St \u2014 8 hours labor, $400 materials. Net 30.',
  estimate:
    'Rough estimate to convert a 2-car garage to a 1BR ADU \u2014 framing, electrical, plumbing, finishes.',
  work_order:
    'Work order: replace leaking water heater at 207 Pine, send Mike Tuesday morning, 50-gal electric.',
  proposal:
    'Proposal to restore a 1920s storefront facade \u2014 brick repair, awning replacement, signage.',
}

export function AiGenerateModal({
  open,
  onClose,
  initialType,
  onApply,
}: AiGenerateModalProps) {
  const fallback: ShippedDocumentType =
    initialType &&
    (SHIPPED_TYPES as readonly DocumentType[]).includes(initialType)
      ? (initialType as ShippedDocumentType)
      : 'bid'
  const [type, setType] = useState<ShippedDocumentType>(fallback)
  const [description, setDescription] = useState(EXAMPLES[fallback])
  const generate = useGenerateAiDocument()

  async function handleGenerate() {
    if (!description.trim()) return
    const patch = await generate.mutateAsync({ description, type })
    onApply(patch)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate with AI"
      description="Describe the work; we\u2019ll draft the document. Review before saving."
      size="xl"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Document type</label>
          <select
            value={type}
            onChange={(e) => {
              const next = e.target.value as ShippedDocumentType
              setType(next)
              // Only swap the description if the user hasn't customized it.
              if (Object.values(EXAMPLES).includes(description)) {
                setDescription(EXAMPLES[next])
              }
            }}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {SHIPPED_TYPES.map((t) => (
              <option key={t} value={t}>
                {DOCUMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Describe the scope, scale, materials, location\u2026"
          />
          <p className="text-xs text-muted-foreground">
            Include enough detail for line items and totals. You can edit the
            result before saving.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={generate.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              void handleGenerate()
            }}
            disabled={generate.isPending || !description.trim()}
          >
            <Sparkles className="h-4 w-4" />
            {generate.isPending ? 'Generating\u2026' : 'Generate'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
