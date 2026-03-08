'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const AdminRealtimeDashboard = dynamic(
  () => import('@hchat/ui/admin/AdminRealtimeDashboard'),
  { loading: () => <SkeletonCard />, ssr: false },
)

export default function RealtimePage() {
  return (
    <ProtectedRoute>
      <AdminRealtimeDashboard />
    </ProtectedRoute>
  )
}
