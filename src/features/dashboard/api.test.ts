/**
 * Dashboard API tests.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as client from '@/lib/api/client'
import { dashboardApi } from './api'

vi.mock('@/lib/api/client')

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getStats', () => {
    it('fetches dashboard stats', async () => {
      const mockStats = {
        properties: 5,
        units: 20,
        occupancy: 85,
        monthlyIncome: 15000,
      }
      vi.mocked(client.request).mockResolvedValue(mockStats)

      const result = await dashboardApi.getStats()

      expect(client.request).toHaveBeenCalledWith('/api/dashboard/stats', {
        method: 'GET',
        signal: undefined,
      })
      expect(result).toEqual(mockStats)
    })
  })

  describe('getRecentDocuments', () => {
    it('fetches recent documents with query params', async () => {
      const mockResponse = {
        documents: [{ id: '1', title: 'Test Doc' }],
        total: 1,
      }
      vi.mocked(client.request).mockResolvedValue(mockResponse)

      await dashboardApi.getRecentDocuments({
        limit: 10,
        sort: 'updatedAt:desc',
      })

      expect(client.request).toHaveBeenCalledWith(
        '/api/documents?limit=10&sort=updatedAt%3Adesc',
        { method: 'GET', signal: undefined }
      )
    })

    it('handles empty params', async () => {
      const mockResponse = { documents: [], total: 0 }
      vi.mocked(client.request).mockResolvedValue(mockResponse)

      await dashboardApi.getRecentDocuments()

      expect(client.request).toHaveBeenCalledWith('/api/documents', {
        method: 'GET',
        signal: undefined,
      })
    })
  })

  describe('getUpcomingTasks', () => {
    it('fetches work orders and maps to tasks', async () => {
      const mockDocs = {
        documents: [
          {
            id: '1',
            type: 'work_order' as const,
            status: 'draft' as const,
            title: 'Fix leak',
            dueDate: '2026-05-15',
            assignedTo: 'John',
            propertyAddress: '123 Main St',
            lineItems: [],
            taxRate: 0,
            overheadRate: 0,
            totals: {
              subtotal: 0,
              taxableSubtotal: 0,
              tax: 0,
              overhead: 0,
              total: 0,
            },
            createdAt: '2026-05-10',
            updatedAt: '2026-05-10',
          },
        ],
        total: 1,
      }
      vi.mocked(client.request).mockResolvedValue(mockDocs)

      const result = await dashboardApi.getUpcomingTasks()

      expect(result).toEqual([
        {
          id: '1',
          title: 'Fix leak',
          dueDate: '2026-05-15',
          status: 'draft',
          assignedTo: 'John',
          propertyAddress: '123 Main St',
        },
      ])
    })

    it('filters out docs without due dates', async () => {
      const mockDocs = {
        documents: [
          {
            id: '1',
            type: 'work_order' as const,
            status: 'draft' as const,
            title: 'No due date',
            lineItems: [],
            taxRate: 0,
            overheadRate: 0,
            totals: {
              subtotal: 0,
              taxableSubtotal: 0,
              tax: 0,
              overhead: 0,
              total: 0,
            },
            createdAt: '2026-05-10',
            updatedAt: '2026-05-10',
          },
        ],
        total: 1,
      }
      vi.mocked(client.request).mockResolvedValue(mockDocs)

      const result = await dashboardApi.getUpcomingTasks()

      expect(result).toEqual([])
    })
  })

  describe('getFinancialSummary', () => {
    it('fetches financial summary', async () => {
      const mockSummary = {
        revenue: 10000,
        expenses: 5000,
        profit: 5000,
        period: 'May 2026',
      }
      vi.mocked(client.request).mockResolvedValue(mockSummary)

      const result = await dashboardApi.getFinancialSummary()

      expect(client.request).toHaveBeenCalledWith('/api/dashboard/financials', {
        method: 'GET',
        signal: undefined,
      })
      expect(result).toEqual(mockSummary)
    })
  })
})
