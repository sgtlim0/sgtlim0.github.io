'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const CustomDashboard = dynamic(
  () => import('@hchat/ui/admin/CustomDashboard'),
  { loading: () => <SkeletonCard />, ssr: false },
)

export default function CustomizePage() {
  return (
    <ProtectedRoute>
      <CustomDashboard />
    </ProtectedRoute>
  )
}
