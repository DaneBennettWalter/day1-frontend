/**
 * Settings feature types
 */

export interface OrgSettings {
  // General/Company
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  ein?: string

  // Branding
  logoUrl?: string
  primaryColor?: string
  accentColor?: string
  theme?: 'light' | 'dark' | 'system'

  // Defaults
  taxRate?: number
  overheadRate?: number
  paymentTerms?: number
  defaultInvoiceNotes?: string

  // AI
  aiEnabled?: boolean
}

export interface ApiKeyStatus {
  hasKey: boolean
  lastUpdated?: string
  keyPreview?: string // e.g., "sk-ant-...****"
}

export interface HealthResponse {
  status: 'ok' | 'error'
  hasAI: boolean
  timestamp: string
}
