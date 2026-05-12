import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Contact, ContactFilters, ContactInput } from './types'
import * as api from './api'

/**
 * TanStack Query hooks for contacts.
 */

const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters?: ContactFilters) =>
    [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
}

export function useContacts(
  filters?: ContactFilters
): UseQueryResult<Contact[], Error> {
  return useQuery({
    queryKey: contactKeys.list(filters),
    queryFn: () => api.listContacts(filters),
  })
}

export function useContact(id: string): UseQueryResult<Contact, Error> {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => api.getContact(id),
    enabled: !!id,
  })
}

export function useCreateContact(): UseMutationResult<
  Contact,
  Error,
  ContactInput
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createContact,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      toast.success('Contact created')
    },
    onError: (error) => {
      toast.error(`Failed to create contact: ${error.message}`)
    },
  })
}

export function useUpdateContact(): UseMutationResult<
  Contact,
  Error,
  { id: string; data: ContactInput }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateContact(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) })
      toast.success('Contact updated')
    },
    onError: (error) => {
      toast.error(`Failed to update contact: ${error.message}`)
    },
  })
}

export function useDeleteContact(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteContact,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      toast.success('Contact deleted')
    },
    onError: (error) => {
      toast.error(`Failed to delete contact: ${error.message}`)
    },
  })
}
