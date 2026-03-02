import { AdminDashboard, ProtectedRoute } from '@hchat/ui/admin'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
