import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const DepartmentManagement = dynamic(
  () => import('@hchat/ui/admin/DepartmentManagement'),
  { loading: () => <SkeletonCard /> }
)

export default function DepartmentsPage() {
  return (
    <ProtectedRoute minRole="admin">
      <DepartmentManagement />
    </ProtectedRoute>
  )
}
