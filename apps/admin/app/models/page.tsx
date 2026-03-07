import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '모델 가격 정보',
}

const AdminModelPricing = dynamic(
  () => import('@hchat/ui/admin').then((m) => ({ default: m.AdminModelPricing })),
  { loading: () => <SkeletonCard /> },
)

export default function ModelsPage() {
  return (
    <ProtectedRoute>
      <AdminModelPricing />
    </ProtectedRoute>
  )
}
