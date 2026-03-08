'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const AdminStatistics = dynamic(
  () => import('@hchat/ui/admin/AdminStatistics'),
  { loading: () => <SkeletonCard /> }
)

export default function StatisticsPage() {
  return (
    <ProtectedRoute>
      <AdminStatistics />
    </ProtectedRoute>
  )
}
