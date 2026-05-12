/**
 * Settings index - redirects to general tab
 */
import { Navigate } from 'react-router-dom'

export default function SettingsIndex() {
  return <Navigate to="/settings/general" replace />
}
