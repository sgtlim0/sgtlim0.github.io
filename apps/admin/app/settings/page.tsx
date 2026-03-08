'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const AdminSettings = dynamic(
  () => import('@hchat/ui/admin/AdminSettings'),
  { loading: () => <SkeletonCard /> }
)

export default function SettingsPage() {
  return (
    <ProtectedRoute minRole="admin">
      <AdminSettings />
    </ProtectedRoute>
  )
}
