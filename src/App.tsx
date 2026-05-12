import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { MarketingShell } from '@/components/layout/MarketingShell'
import { SettingsShell } from '@/components/layout/SettingsShell'
import LoginRoute from '@/routes/login'
import RegisterRoute from '@/routes/register'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ChatRoute from '@/routes/chat'
import SettingsIndex from '@/routes/settings/index'
import GeneralSettings from '@/routes/settings/general'
import AiSettings from '@/routes/settings/ai'
import BrandingSettings from '@/routes/settings/branding'
import TeamSettings from '@/routes/settings/team'

export default function App() {
  return (
    <BrowserRouter>
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

          {/* Settings with nested tabs */}
          <Route path="/settings" element={<SettingsShell />}>
            <Route index element={<SettingsIndex />} />
            <Route path="general" element={<GeneralSettings />} />
            <Route path="ai" element={<AiSettings />} />
            <Route path="branding" element={<BrandingSettings />} />
            <Route path="team" element={<TeamSettings />} />
          </Route>
        </Route>

        {/* Root + fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
