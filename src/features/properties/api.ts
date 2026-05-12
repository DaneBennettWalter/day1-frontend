import { request } from '@/lib/api/client'
import type {
  Property,
  PropertyInput,
  PropertyFilters,
  PropertyWithStats,
  Unit,
  UnitInput,
  RentRollItem,
  PortfolioStats,
} from './types'

/**
 * Property API client.
 */

export async function listProperties(
  filters?: PropertyFilters
): Promise<PropertyWithStats[]> {
  const params = new URLSearchParams()
  if (filters?.q) params.set('q', filters.q)
  if (filters?.type) params.set('type', filters.type)
  if (filters?.sortBy) params.set('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder)

  const query = params.toString()
  return request<PropertyWithStats[]>(
    `/api/properties${query ? `?${query}` : ''}`
  )
}

export async function createProperty(data: PropertyInput): Promise<Property> {
  return request<Property>('/api/properties', {
    method: 'POST',
    body: data,
  })
}

export async function getProperty(id: string): Promise<Property> {
  return request<Property>(`/api/properties/${id}`)
}

export async function updateProperty(
  id: string,
  data: PropertyInput
): Promise<Property> {
  return request<Property>(`/api/properties/${id}`, {
    method: 'PUT',
    body: data,
  })
}

export async function deleteProperty(id: string): Promise<void> {
  await request<void>(`/api/properties/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Units API.
 */

export async function listUnits(propertyId: string): Promise<Unit[]> {
  return request<Unit[]>(`/api/properties/${propertyId}/units`)
}

export async function createUnit(
  propertyId: string,
  data: UnitInput
): Promise<Unit> {
  return request<Unit>(`/api/properties/${propertyId}/units`, {
    method: 'POST',
    body: data,
  })
}

export async function updateUnit(id: string, data: UnitInput): Promise<Unit> {
  return request<Unit>(`/api/units/${id}`, {
    method: 'PUT',
    body: data,
  })
}

export async function deleteUnit(id: string): Promise<void> {
  await request<void>(`/api/units/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Rent roll and stats.
 */

export async function getRentRoll(): Promise<RentRollItem[]> {
  return request<RentRollItem[]>('/api/properties/rent-roll')
}

export async function getPortfolioStats(): Promise<PortfolioStats> {
  return request<PortfolioStats>('/api/properties/stats')
}
