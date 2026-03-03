import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'

const DepartmentManagement = dynamic(
  () => import('@hchat/ui/admin').then(m => ({ default: m.DepartmentManagement })),
  { loading: () => <SkeletonCard /> }
)

export default function DepartmentsPage() {
  return (
    <ProtectedRoute minRole="admin">
      <DepartmentManagement />
    </ProtectedRoute>
  )
}
