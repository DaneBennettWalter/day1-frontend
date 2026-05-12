/**
 * Payments hooks.
 *
 * TanStack Query for list/detail; mutations for the two-step
 * intent → confirm flow. Cache invalidation is keyed off the
 * `paymentsKeys` factory to keep the wiring tight.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { paymentsApi } from './api'
import type {
  ConfirmPaymentInput,
  CreatePaymentIntentInput,
  ListPaymentsParams,
} from './types'

export const paymentsKeys = {
  all: ['payments'] as const,
  list: (params: ListPaymentsParams) =>
    [...paymentsKeys.all, 'list', params] as const,
  detail: (id: string) => [...paymentsKeys.all, 'detail', id] as const,
}

export function usePaymentsList(params: ListPaymentsParams = {}) {
  return useQuery({
    queryKey: paymentsKeys.list(params),
    queryFn: ({ signal }) => paymentsApi.list(params, signal),
  })
}

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: id ? paymentsKeys.detail(id) : ['payments', 'detail', '__none'],
    queryFn: ({ signal }) => paymentsApi.get(id!, signal),
    enabled: !!id,
  })
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (input: CreatePaymentIntentInput) =>
      paymentsApi.createIntent(input),
    onError: (err: Error) => {
      toast.error(err.message || 'Could not start payment')
    },
  })
}

export function useConfirmPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ConfirmPaymentInput) => paymentsApi.confirm(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: paymentsKeys.all })
      toast.success('Payment recorded')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not confirm payment')
    },
  })
}
