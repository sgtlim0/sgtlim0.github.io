import { AdminUsageHistory, ProtectedRoute } from '@hchat/ui/admin'

export default function UsagePage() {
  return (
    <ProtectedRoute>
      <AdminUsageHistory />
    </ProtectedRoute>
  )
}
