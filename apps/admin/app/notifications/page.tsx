import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '알림 센터',
}

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
