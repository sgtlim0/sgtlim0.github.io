'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const AdminUsageHistory = dynamic(
  () => import('@hchat/ui/admin/AdminUsageHistory'),
  { loading: () => <SkeletonCard /> }
)

export default function UsagePage() {
  return (
    <ProtectedRoute>
      <AdminUsageHistory />
    </ProtectedRoute>
  )
}
