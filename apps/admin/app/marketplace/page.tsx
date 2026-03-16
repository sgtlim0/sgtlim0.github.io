import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '에이전트 마켓플레이스',
}

const AgentMarketplace = dynamic(
  () => import('@hchat/ui/admin/AgentMarketplace').then((m) => m.AgentMarketplace),
  { loading: () => <SkeletonCard /> }
)

export default function MarketplacePage() {
  return (
    <ProtectedRoute>
      <AgentMarketplace />
    </ProtectedRoute>
  )
}
