'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const WorkflowBuilder = dynamic(
  () => import('@hchat/ui/admin/WorkflowBuilder'),
  { loading: () => <SkeletonCard />, ssr: false },
)

export default function WorkflowsPage() {
  return (
    <ProtectedRoute>
      <WorkflowBuilder />
    </ProtectedRoute>
  )
}
