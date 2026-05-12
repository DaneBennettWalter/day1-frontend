/**
 * Root app: routing + global error boundary + code-split route chunks.
 *
 * Every route is loaded via React.lazy so the initial JS payload stays
 * small (only Marketing + Login ship in the entry chunk). Suspense
 * fallbacks share a single Skeleton fallback for visual consistency.
 *
 * Adding a route? Three steps:
 *   1. `const X = lazy(() => import('@/routes/x'))`
 *   2. `<Route path="…" element={<X />} />`
 *   3. Add a nav entry in Sidebar if user-facing.
 */

import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RouteFallback } from '@/components/feedback/RouteFallback'
import { AppShell } from '@/components/layout/AppShell'
import { MarketingShell } from '@/components/layout/MarketingShell'
import { SettingsShell } from '@/components/layout/SettingsShell'

// Auth (small, but lazy keeps the marketing shell chunk tight)
const LoginRoute = lazy(() => import('@/routes/login'))
const RegisterRoute = lazy(() => import('@/routes/register'))

// Core
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const ChatRoute = lazy(() => import('@/routes/chat'))

// Documents
const DocumentsListRoute = lazy(() => import('@/routes/documents/list'))
const DocumentsKanbanRoute = lazy(() => import('@/routes/documents/kanban'))
const NewDocumentRoute = lazy(() => import('@/routes/documents/new'))
const EditDocumentRoute = lazy(() => import('@/routes/documents/edit'))

// Contacts
const ContactsPage = lazy(() =>
  import('@/routes/contacts').then((m) => ({ default: m.ContactsPage }))
)
const ContactDetailPage = lazy(() =>
  import('@/routes/contactDetail').then((m) => ({
    default: m.ContactDetailPage,
  }))
)

// Properties
const PropertiesPage = lazy(() =>
  import('@/routes/properties').then((m) => ({ default: m.PropertiesPage }))
)
const PropertyDetailPage = lazy(() =>
  import('@/routes/propertyDetail').then((m) => ({
    default: m.PropertyDetailPage,
  }))
)
const RentRollPage = lazy(() =>
  import('@/routes/rentRoll').then((m) => ({ default: m.RentRollPage }))
)

// Payments (Phase 8)
const PaymentsRoute = lazy(() => import('@/routes/payments'))
const PaymentDetailRoute = lazy(() => import('@/routes/payments/detail'))

// Settings
const SettingsIndex = lazy(() => import('@/routes/settings/index'))
const GeneralSettings = lazy(() => import('@/routes/settings/general'))
const AiSettings = lazy(() => import('@/routes/settings/ai'))
const BrandingSettings = lazy(() => import('@/routes/settings/branding'))
const TeamSettings = lazy(() => import('@/routes/settings/team'))

// 404
const NotFoundRoute = lazy(() => import('@/routes/notFound'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public */}
          <Route element={<MarketingShell />}>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegisterRoute />} />
          </Route>

          {/* Protected */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* AI Chat */}
            <Route path="/chat" element={<ChatRoute />} />
            <Route path="/chat/:conversationId" element={<ChatRoute />} />

            {/* Documents */}
            <Route path="/documents" element={<DocumentsListRoute />} />
            <Route
              path="/documents/kanban"
              element={<DocumentsKanbanRoute />}
            />
            <Route path="/documents/new" element={<NewDocumentRoute />} />
            <Route path="/documents/:id/edit" element={<EditDocumentRoute />} />

            {/* Contacts */}
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/contacts/:id" element={<ContactDetailPage />} />

            {/* Properties */}
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/rent-roll" element={<RentRollPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />

            {/* Payments */}
            <Route path="/payments" element={<PaymentsRoute />} />
            <Route path="/payments/:id" element={<PaymentDetailRoute />} />

            {/* Settings with nested tabs */}
            <Route path="/settings" element={<SettingsShell />}>
              <Route index element={<SettingsIndex />} />
              <Route path="general" element={<GeneralSettings />} />
              <Route path="ai" element={<AiSettings />} />
              <Route path="branding" element={<BrandingSettings />} />
              <Route path="team" element={<TeamSettings />} />
            </Route>

            {/* 404 inside protected shell so the chrome stays consistent. */}
            <Route path="*" element={<NotFoundRoute />} />
          </Route>

          {/* Root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
