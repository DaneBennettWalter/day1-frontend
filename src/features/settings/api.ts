/**
 * Settings API client
 */
import { request } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { OrgSettings, ApiKeyStatus, HealthResponse } from './types'

/**
 * Get organization settings
 */
export async function getSettings(signal?: AbortSignal): Promise<OrgSettings> {
  return request<OrgSettings>(endpoints.settings.get, {
    method: 'GET',
    signal,
  })
}

/**
 * Update organization settings
 * Partial updates are supported
 */
export async function updateSettings(
  settings: Partial<OrgSettings>,
  signal?: AbortSignal
): Promise<OrgSettings> {
  return request<OrgSettings>(endpoints.settings.update, {
    method: 'PUT',
    body: settings,
    signal,
  })
}

/**
 * Check AI health status
 */
export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return request<HealthResponse>(endpoints.settings.health, {
    method: 'GET',
    signal,
  })
}

/**
 * Save user-supplied API key (Path B)
 * Key is encrypted server-side, never stored client-side
 */
export async function saveApiKey(
  apiKey: string,
  signal?: AbortSignal
): Promise<ApiKeyStatus> {
  return request<ApiKeyStatus>(endpoints.settings.apiKey, {
    method: 'POST',
    body: { apiKey },
    signal,
  })
}
