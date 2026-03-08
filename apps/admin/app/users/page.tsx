'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const AdminUserManagement = dynamic(
  () => import('@hchat/ui/admin/AdminUserManagement'),
  { loading: () => <SkeletonCard /> }
)

export default function UsersPage() {
  return (
    <ProtectedRoute minRole="admin">
      <AdminUserManagement />
    </ProtectedRoute>
  )
}
