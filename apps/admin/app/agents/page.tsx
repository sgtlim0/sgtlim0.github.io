import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '에이전트 모니터링',
}

const AdminAgentMonitoring = dynamic(
  () => import('@hchat/ui/admin').then(m => ({ default: m.AdminAgentMonitoring })),
  { loading: () => <SkeletonCard /> }
)

export default function AgentsPage() {
  return (
    <ProtectedRoute>
      <AdminAgentMonitoring />
    </ProtectedRoute>
  )
}
