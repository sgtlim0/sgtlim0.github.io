import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const DocsPage = dynamic(
  () => import('@hchat/ui/user').then(m => ({ default: m.DocsPage })),
  { loading: () => <SkeletonCard /> }
)

export const metadata = { title: '문서 작성' }

export default function Page() {
  return <DocsPage />
}
