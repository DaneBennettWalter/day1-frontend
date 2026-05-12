/**
 * Documents API client.
 *
 * Thin wrapper over `lib/api/client` with typed surfaces; uses the centralized
 * `endpoints` registry. Filters serialize to a query string.
 */

import { request } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type {
  Document,
  DocumentInput,
  ListDocumentsParams,
  ListDocumentsResponse,
} from './types'

function buildQuery(params: ListDocumentsParams): string {
  const usp = new URLSearchParams()
  if (params.type) usp.set('type', params.type)
  if (params.status) usp.set('status', params.status)
  if (params.from) usp.set('from', params.from)
  if (params.to) usp.set('to', params.to)
  if (params.q) usp.set('q', params.q)
  const s = usp.toString()
  return s ? `?${s}` : ''
}

export async function listDocuments(
  params: ListDocumentsParams = {},
  signal?: AbortSignal
): Promise<ListDocumentsResponse> {
  return request<ListDocumentsResponse>(
    `${endpoints.documents.list}${buildQuery(params)}`,
    { method: 'GET', signal }
  )
}

export async function getDocument(
  id: string,
  signal?: AbortSignal
): Promise<Document> {
  return request<Document>(endpoints.documents.get(id), {
    method: 'GET',
    signal,
  })
}

export async function createDocument(
  input: DocumentInput,
  signal?: AbortSignal
): Promise<Document> {
  return request<Document>(endpoints.documents.create, {
    method: 'POST',
    body: input,
    signal,
  })
}

export async function updateDocument(
  id: string,
  input: DocumentInput,
  signal?: AbortSignal
): Promise<Document> {
  return request<Document>(endpoints.documents.update(id), {
    method: 'PUT',
    body: input,
    signal,
  })
}

export async function deleteDocument(
  id: string,
  signal?: AbortSignal
): Promise<void> {
  return request<void>(endpoints.documents.delete(id), {
    method: 'DELETE',
    signal,
  })
}

export const documentsApi = {
  list: listDocuments,
  get: getDocument,
  create: createDocument,
  update: updateDocument,
  delete: deleteDocument,
}
