import { DepartmentManagement, ProtectedRoute } from '@hchat/ui/admin'

export default function DepartmentsPage() {
  return (
    <ProtectedRoute minRole="admin">
      <DepartmentManagement />
    </ProtectedRoute>
  )
}
