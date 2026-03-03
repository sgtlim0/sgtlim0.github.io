import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '프롬프트 라이브러리',
}

const AdminPromptLibrary = dynamic(
  () => import('@hchat/ui/admin').then(m => ({ default: m.AdminPromptLibrary })),
  { loading: () => <SkeletonCard /> }
)

export default function PromptsPage() {
  return (
    <ProtectedRoute>
      <AdminPromptLibrary />
    </ProtectedRoute>
  )
}
