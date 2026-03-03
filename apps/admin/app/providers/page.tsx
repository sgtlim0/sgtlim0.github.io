import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 제공자 상태',
}

const AdminProviderStatus = dynamic(
  () => import('@hchat/ui/admin').then(m => ({ default: m.AdminProviderStatus })),
  { loading: () => <SkeletonCard /> }
)

export default function ProvidersPage() {
  return (
    <ProtectedRoute>
      <AdminProviderStatus />
    </ProtectedRoute>
  )
}
