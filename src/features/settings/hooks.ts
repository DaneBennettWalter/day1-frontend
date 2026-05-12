/**
 * Settings TanStack Query hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSettings, updateSettings, getHealth, saveApiKey } from './api'
import type { OrgSettings } from './types'

const SETTINGS_KEY = ['settings'] as const
const HEALTH_KEY = ['health'] as const

/**
 * Fetch organization settings
 */
export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: ({ signal }) => getSettings(signal),
  })
}

/**
 * Update organization settings with optimistic updates
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<OrgSettings>) => updateSettings(settings),
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: SETTINGS_KEY })

      // Snapshot current value
      const previous = queryClient.getQueryData<OrgSettings>(SETTINGS_KEY)

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<OrgSettings>(SETTINGS_KEY, {
          ...previous,
          ...newSettings,
        })
      }

      return { previous }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(SETTINGS_KEY, context.previous)
      }
      toast.error('Failed to save settings. Please try again.')
      console.error('Settings update error:', error)
    },
    onSuccess: () => {
      toast.success('Settings saved')
    },
    onSettled: () => {
      // Always refetch after error or success
      void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY })
    },
  })
}

/**
 * Check AI health status
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: HEALTH_KEY,
    queryFn: ({ signal }) => getHealth(signal),
    staleTime: 60_000, // 1 minute - don't hammer the health endpoint
    refetchOnWindowFocus: true,
  })
}

/**
 * Save API key
 */
export function useSaveApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (apiKey: string) => saveApiKey(apiKey),
    onSuccess: () => {
      toast.success('API key saved securely')
      // Refetch health to update AI availability
      void queryClient.invalidateQueries({ queryKey: HEALTH_KEY })
    },
    onError: (error) => {
      toast.error('Failed to save API key. Please check the key and try again.')
      console.error('API key save error:', error)
    },
  })
}
