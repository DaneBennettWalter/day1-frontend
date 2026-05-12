import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRentRoll } from '../hooks'
import { UnitStatusBadge } from './UnitStatusBadge'
import { UNIT_STATUSES, UNIT_STATUS_LABELS, type UnitStatus } from '../types'

type SortField = 'property' | 'unit' | 'tenant' | 'rent' | 'leaseEnd' | 'status'
type SortOrder = 'asc' | 'desc'

export function RentRoll() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('property')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const { data: rentRoll = [], isLoading } = useRentRoll()

  // Client-side filtering and sorting
  const filtered = rentRoll.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        item.propertyAddress.toLowerCase().includes(searchLower) ||
        item.unitNumber.toLowerCase().includes(searchLower) ||
        item.tenantName?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    let aVal: string | number = ''
    let bVal: string | number = ''

    switch (sortField) {
      case 'property':
        aVal = a.propertyAddress
        bVal = b.propertyAddress
        break
      case 'unit':
        aVal = a.unitNumber
        bVal = b.unitNumber
        break
      case 'tenant':
        aVal = a.tenantName || ''
        bVal = b.tenantName || ''
        break
      case 'rent':
        aVal = a.rentAmount || 0
        bVal = b.rentAmount || 0
        break
      case 'leaseEnd':
        aVal = a.leaseEnd || ''
        bVal = b.leaseEnd || ''
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }

    const strA = String(aVal).toLowerCase()
    const strB = String(bVal).toLowerCase()
    if (strA < strB) return sortOrder === 'asc' ? -1 : 1
    if (strA > strB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const totalRent = filtered
    .filter((item) => item.status === 'occupied' && item.rentAmount)
    .reduce((sum, item) => sum + (item.rentAmount || 0), 0)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading rent roll...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4">
          <Input
            placeholder="Search properties, units, tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as UnitStatus | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {UNIT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {UNIT_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Monthly Rent</p>
          <p className="text-2xl font-bold">${totalRent.toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="flex h-64 items-center justify-center border rounded-lg">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No units found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add properties and units to see the rent roll'}
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    <button
                      onClick={() => toggleSort('property')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Property
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    <button
                      onClick={() => toggleSort('unit')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Unit
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    <button
                      onClick={() => toggleSort('status')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Beds/Baths
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Sq Ft
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    <button
                      onClick={() => toggleSort('rent')}
                      className="flex items-center gap-1 hover:text-primary ml-auto"
                    >
                      Rent
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    <button
                      onClick={() => toggleSort('tenant')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Tenant
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    <button
                      onClick={() => toggleSort('leaseEnd')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Lease End
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.map((item) => (
                  <tr
                    key={item.unitId}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/properties/${item.propertyId}`)}
                  >
                    <td className="px-4 py-3 text-sm">
                      {item.propertyAddress}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{item.unitNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <UnitStatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.bedrooms !== undefined ||
                      item.bathrooms !== undefined
                        ? `${item.bedrooms || 0}/${item.bathrooms || 0}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.squareFeet?.toLocaleString() || '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      {item.rentAmount
                        ? `$${item.rentAmount.toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.tenantName || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.leaseEnd
                        ? new Date(item.leaseEnd).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
