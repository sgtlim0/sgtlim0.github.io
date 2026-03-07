'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'

const NotificationCenter = dynamic(
  () => import('@hchat/ui/admin').then((m) => ({ default: m.NotificationCenter })),
  { loading: () => <SkeletonCard />, ssr: false },
)

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationCenter />
    </ProtectedRoute>
  )
}
