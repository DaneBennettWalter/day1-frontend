/**
 * Settings API client
 */
import { request } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { OrgSettings, ApiKeyStatus, HealthResponse } from './types'

// Backend response structure (different from frontend types)
interface BackendSettings {
  name: string
  slug: string
  description?: string
  company?: {
    name?: string
    address?: string
    phone?: string
    email?: string
    ein?: string
    logoUrl?: string
    primaryColor?: string
    accentColor?: string
  }
  apiKey?: string
  features?: {
    ai?: boolean
  }
}

// Transform backend response to frontend format
function normalizeSettings(backend: BackendSettings): OrgSettings {
  return {
    name: backend.company?.name || backend.name || '',
    description: backend.description,
    address: backend.company?.address,
    phone: backend.company?.phone,
    email: backend.company?.email,
    ein: backend.company?.ein,
    logoUrl: backend.company?.logoUrl,
    primaryColor: backend.company?.primaryColor || '#2563eb',
    accentColor: backend.company?.accentColor || '#7c3aed',
    theme: 'system', // Always default to system
    aiEnabled: backend.features?.ai || false,
  }
}

// Transform frontend update to backend format
function denormalizeSettings(
  settings: Partial<OrgSettings>
): Partial<BackendSettings> {
  return {
    company: {
      name: settings.name,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      ein: settings.ein,
      logoUrl: settings.logoUrl,
      primaryColor: settings.primaryColor,
      accentColor: settings.accentColor,
    },
    description: settings.description,
  }
}

/**
 * Get organization settings
 */
export async function getSettings(signal?: AbortSignal): Promise<OrgSettings> {
  const backend = await request<BackendSettings>(endpoints.settings.get, {
    method: 'GET',
    signal,
  })
  return normalizeSettings(backend)
}

/**
 * Update organization settings
 * Partial updates are supported
 */
export async function updateSettings(
  settings: Partial<OrgSettings>,
  signal?: AbortSignal
): Promise<OrgSettings> {
  const body: Partial<BackendSettings> = denormalizeSettings(settings)
  const backend = await request<BackendSettings>(endpoints.settings.update, {
    method: 'PUT',
    body,
    signal,
  })
  return normalizeSettings(backend)
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
