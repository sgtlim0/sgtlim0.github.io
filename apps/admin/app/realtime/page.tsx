'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'

const AdminRealtimeDashboard = dynamic(
  () => import('@hchat/ui/admin').then((m) => ({ default: m.AdminRealtimeDashboard })),
  { loading: () => <SkeletonCard />, ssr: false },
)

export default function RealtimePage() {
  return (
    <ProtectedRoute>
      <AdminRealtimeDashboard />
    </ProtectedRoute>
  )
}
