import { useNavigate, useSearchParams } from 'react-router-dom'
import { DocumentEditor } from '@/features/documents/components/DocumentEditor'
import { blankDocument, useCreateDocument } from '@/features/documents/hooks'
import {
  SHIPPED_TYPES,
  type DocumentInput,
  type DocumentType,
} from '@/features/documents/types'

export default function NewDocumentRoute() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryType = params.get('type') as DocumentType | null
  const initialType =
    queryType && (SHIPPED_TYPES as readonly string[]).includes(queryType)
      ? queryType
      : 'bid'

  const create = useCreateDocument()

  async function handleSave(input: DocumentInput) {
    const doc = await create.mutateAsync(input)
    navigate(`/documents/${doc.id}/edit`)
  }

  return (
    <DocumentEditor
      initial={blankDocument(initialType)}
      isNew
      onSave={handleSave}
      onCancel={() => navigate('/documents')}
      saving={create.isPending}
    />
  )
}
