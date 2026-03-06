import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '대시보드 커스터마이징',
}

const CustomDashboard = dynamic(
  () => import('@hchat/ui/admin').then((m) => ({ default: m.CustomDashboard })),
  { loading: () => <SkeletonCard />, ssr: false },
)

export default function CustomizePage() {
  return (
    <ProtectedRoute>
      <CustomDashboard />
    </ProtectedRoute>
  )
}
