import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '기능별 사용량',
  description: 'AI 기능 사용 현황 및 트렌드 분석',
}

const AdminFeatureUsage = dynamic(
  () => import('@hchat/ui/admin').then(m => ({ default: m.AdminFeatureUsage })),
  { loading: () => <SkeletonCard /> }
)

export default function FeaturesPage() {
  return (
    <ProtectedRoute>
      <AdminFeatureUsage />
    </ProtectedRoute>
  )
}
