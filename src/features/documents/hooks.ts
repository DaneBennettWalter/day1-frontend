/**
 * Documents hooks.
 *
 * TanStack Query for server state; optimistic mutations for status changes
 * (kanban drag) so the UI feels instant. Failures roll back via `onError`.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { aiChatApi } from '@/features/ai-chat/api'
import { documentsApi } from './api'
import { parseAiDocument } from './aiParse'
import type {
  AiGenerateDocumentInput,
  Document,
  DocumentInput,
  DocumentStatus,
  DocumentType,
  ListDocumentsParams,
  ListDocumentsResponse,
} from './types'

export const documentsKeys = {
  all: ['documents'] as const,
  list: (params: ListDocumentsParams) =>
    [...documentsKeys.all, 'list', params] as const,
  detail: (id: string) => [...documentsKeys.all, 'detail', id] as const,
}

export function useDocumentsList(params: ListDocumentsParams = {}) {
  return useQuery({
    queryKey: documentsKeys.list(params),
    queryFn: ({ signal }) => documentsApi.list(params, signal),
  })
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: id ? documentsKeys.detail(id) : ['documents', 'detail', '__none'],
    queryFn: ({ signal }) => documentsApi.get(id!, signal),
    enabled: !!id,
  })
}

export function useCreateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: DocumentInput) => documentsApi.create(input),
    onSuccess: (doc) => {
      void qc.invalidateQueries({ queryKey: documentsKeys.all })
      qc.setQueryData(documentsKeys.detail(doc.id), doc)
      toast.success('Document created')
    },
    onError: (err: Error) => {
      toast.error(`Failed to create: ${err.message}`)
    },
  })
}

export function useUpdateDocument(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: DocumentInput) => documentsApi.update(id, input),
    onSuccess: (doc) => {
      void qc.invalidateQueries({ queryKey: documentsKeys.all })
      qc.setQueryData(documentsKeys.detail(doc.id), doc)
      toast.success('Saved')
    },
    onError: (err: Error) => {
      toast.error(`Save failed: ${err.message}`)
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentsKeys.all })
      toast.success('Deleted')
    },
    onError: (err: Error) => {
      toast.error(`Delete failed: ${err.message}`)
    },
  })
}

/**
 * Optimistic status change — used by the kanban board.
 * The dragged card moves immediately; rollback on failure.
 */
export function useChangeDocumentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      doc,
      status,
    }: {
      doc: Document
      status: DocumentStatus
    }) => {
      const input: DocumentInput = {
        type: doc.type,
        status,
        number: doc.number,
        title: doc.title,
        description: doc.description,
        customer: doc.customer,
        propertyId: doc.propertyId,
        propertyAddress: doc.propertyAddress,
        dueDate: doc.dueDate,
        paymentTerms: doc.paymentTerms,
        assignedTo: doc.assignedTo,
        tasks: doc.tasks,
        lineItems: doc.lineItems,
        taxRate: doc.taxRate,
        overheadRate: doc.overheadRate,
      }
      return documentsApi.update(doc.id, input)
    },
    onMutate: async ({ doc, status }) => {
      await qc.cancelQueries({ queryKey: documentsKeys.all })

      // Snapshot every active list cache for rollback.
      const snapshots = qc.getQueriesData<ListDocumentsResponse>({
        queryKey: [...documentsKeys.all, 'list'],
      })

      for (const [key, value] of snapshots) {
        if (!value) continue
        const next: ListDocumentsResponse = {
          ...value,
          documents: value.documents.map((d) =>
            d.id === doc.id ? { ...d, status } : d
          ),
        }
        qc.setQueryData(key, next)
      }

      return { snapshots }
    },
    onError: (err: Error, _vars, ctx) => {
      // Roll back.
      if (ctx?.snapshots) {
        for (const [key, value] of ctx.snapshots) {
          qc.setQueryData(key, value)
        }
      }
      toast.error(`Status update failed: ${err.message}`)
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: documentsKeys.all })
    },
  })
}

export function useGenerateAiDocument() {
  return useMutation({
    mutationFn: async (input: AiGenerateDocumentInput) => {
      const res = await aiChatApi.generate({
        description: input.description,
        type: input.type,
      })
      return parseAiDocument(res.document as unknown, input.type)
    },
    onError: (err: Error) => {
      toast.error(`AI generation failed: ${err.message}`)
    },
  })
}

/** Used by route loaders / new-document defaults. */
export function blankDocument(type: DocumentType = 'bid'): DocumentInput {
  return {
    type,
    status: 'draft',
    title: '',
    description: '',
    customer: { name: '', email: '', phone: '', address: '' },
    propertyAddress: '',
    dueDate: '',
    paymentTerms: '',
    assignedTo: '',
    tasks: [],
    lineItems: [],
    taxRate: 0.0825,
    overheadRate: 0.1,
  }
}
