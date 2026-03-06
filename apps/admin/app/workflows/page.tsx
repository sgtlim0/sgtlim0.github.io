import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 워크플로우 빌더',
}

const WorkflowBuilder = dynamic(
  () => import('@hchat/ui/admin').then((m) => ({ default: m.WorkflowBuilder })),
  { loading: () => <SkeletonCard />, ssr: false },
)

export default function WorkflowsPage() {
  return (
    <ProtectedRoute>
      <WorkflowBuilder />
    </ProtectedRoute>
  )
}
