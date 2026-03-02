import { AdminUserManagement, ProtectedRoute } from '@hchat/ui/admin'

export default function UsersPage() {
  return (
    <ProtectedRoute minRole="admin">
      <AdminUserManagement />
    </ProtectedRoute>
  )
}
