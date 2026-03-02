import { AdminSettings, ProtectedRoute } from '@hchat/ui/admin'

export default function SettingsPage() {
  return (
    <ProtectedRoute minRole="admin">
      <AdminSettings />
    </ProtectedRoute>
  )
}
