'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const AdminDashboard = dynamic(
  () => import('@hchat/ui/admin/AdminDashboard'),
  { loading: () => <SkeletonCard /> }
)

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
