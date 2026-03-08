import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '프롬프트 라이브러리',
}

const AdminPromptLibrary = dynamic(
  () => import('@hchat/ui/admin/AdminPromptLibrary'),
  { loading: () => <SkeletonCard /> }
)

export default function PromptsPage() {
  return (
    <ProtectedRoute>
      <AdminPromptLibrary />
    </ProtectedRoute>
  )
}
