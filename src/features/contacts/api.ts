import { request } from '@/lib/api/client'
import type { Contact, ContactFilters, ContactInput } from './types'

/**
 * Contact API client.
 */

export async function listContacts(
  filters?: ContactFilters
): Promise<Contact[]> {
  const params = new URLSearchParams()
  if (filters?.q) params.set('q', filters.q)
  if (filters?.type) params.set('type', filters.type)
  if (filters?.sortBy) params.set('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder)

  const query = params.toString()
  return request<Contact[]>(`/api/contacts${query ? `?${query}` : ''}`)
}

export async function createContact(data: ContactInput): Promise<Contact> {
  return request<Contact>('/api/contacts', {
    method: 'POST',
    body: data,
  })
}

export async function getContact(id: string): Promise<Contact> {
  return request<Contact>(`/api/contacts/${id}`)
}

export async function updateContact(
  id: string,
  data: ContactInput
): Promise<Contact> {
  return request<Contact>(`/api/contacts/${id}`, {
    method: 'PUT',
    body: data,
  })
}

export async function deleteContact(id: string): Promise<void> {
  await request<void>(`/api/contacts/${id}`, {
    method: 'DELETE',
  })
}
