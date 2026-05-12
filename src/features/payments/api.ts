/**
 * Payments API client.
 *
 * Thin typed wrapper over `lib/api/client`. Mirrors the four backend
 * endpoints documented in 03-implementation-plan.md.
 */

import { request } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type {
  ConfirmPaymentInput,
  CreatePaymentIntentInput,
  CreatePaymentIntentResponse,
  ListPaymentsParams,
  ListPaymentsResponse,
  Payment,
} from './types'

function buildQuery(params: ListPaymentsParams): string {
  const usp = new URLSearchParams()
  if (params.status) usp.set('status', params.status)
  if (params.documentId) usp.set('documentId', params.documentId)
  if (params.from) usp.set('from', params.from)
  if (params.to) usp.set('to', params.to)
  const s = usp.toString()
  return s ? `?${s}` : ''
}

async function list(
  params: ListPaymentsParams = {},
  signal?: AbortSignal
): Promise<ListPaymentsResponse> {
  return request<ListPaymentsResponse>(
    `${endpoints.payments.list}${buildQuery(params)}`,
    { method: 'GET', signal }
  )
}

async function get(id: string, signal?: AbortSignal): Promise<Payment> {
  return request<Payment>(endpoints.payments.get(id), {
    method: 'GET',
    signal,
  })
}

async function createIntent(
  input: CreatePaymentIntentInput,
  signal?: AbortSignal
): Promise<CreatePaymentIntentResponse> {
  return request<CreatePaymentIntentResponse>(endpoints.payments.createIntent, {
    method: 'POST',
    body: input,
    signal,
  })
}

async function confirm(
  input: ConfirmPaymentInput,
  signal?: AbortSignal
): Promise<Payment> {
  return request<Payment>(endpoints.payments.confirm, {
    method: 'POST',
    body: input,
    signal,
  })
}

export const paymentsApi = { list, get, createIntent, confirm }
