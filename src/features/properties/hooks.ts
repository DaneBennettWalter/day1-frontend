import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from './api'
import type { PropertyInput, PropertyFilters, UnitInput } from './types'

/**
 * Property hooks.
 */

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => api.listProperties(filters),
  })
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => api.getProperty(id!),
    enabled: !!id,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.createProperty,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void queryClient.invalidateQueries({ queryKey: ['portfolio-stats'] })
      toast.success('Property created')
    },
    onError: () => {
      toast.error('Failed to create property')
    },
  })
}

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PropertyInput) => api.updateProperty(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void queryClient.invalidateQueries({ queryKey: ['property', id] })
      void queryClient.invalidateQueries({ queryKey: ['portfolio-stats'] })
      toast.success('Property updated')
    },
    onError: () => {
      toast.error('Failed to update property')
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteProperty,
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void queryClient.removeQueries({ queryKey: ['property', id] })
      void queryClient.invalidateQueries({ queryKey: ['portfolio-stats'] })
      toast.success('Property deleted')
    },
    onError: () => {
      toast.error('Failed to delete property')
    },
  })
}

/**
 * Unit hooks.
 */

export function useUnits(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['units', propertyId],
    queryFn: () => api.listUnits(propertyId!),
    enabled: !!propertyId,
  })
}

export function useCreateUnit(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UnitInput) => api.createUnit(propertyId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['units', propertyId] })
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void queryClient.invalidateQueries({ queryKey: ['property', propertyId] })
      void queryClient.invalidateQueries({ queryKey: ['rent-roll'] })
      void queryClient.invalidateQueries({ queryKey: ['portfolio-stats'] })
      toast.success('Unit created')
    },
    onError: () => {
      toast.error('Failed to create unit')
    },
  })
}

export function useUpdateUnit(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UnitInput) => api.updateUnit(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['units'] })
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void queryClient.invalidateQueries({ queryKey: ['rent-roll'] })
      void queryClient.invalidateQueries({ queryKey: ['portfolio-stats'] })
      toast.success('Unit updated')
    },
    onError: () => {
      toast.error('Failed to update unit')
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteUnit,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['units'] })
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void queryClient.invalidateQueries({ queryKey: ['rent-roll'] })
      void queryClient.invalidateQueries({ queryKey: ['portfolio-stats'] })
      toast.success('Unit deleted')
    },
    onError: () => {
      toast.error('Failed to delete unit')
    },
  })
}

/**
 * Rent roll and stats hooks.
 */

export function useRentRoll() {
  return useQuery({
    queryKey: ['rent-roll'],
    queryFn: api.getRentRoll,
  })
}

export function usePortfolioStats() {
  return useQuery({
    queryKey: ['portfolio-stats'],
    queryFn: api.getPortfolioStats,
  })
}
