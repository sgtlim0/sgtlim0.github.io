import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const OCRPage = dynamic(
  () => import('@hchat/ui/user').then(m => ({ default: m.OCRPage })),
  { loading: () => <SkeletonCard /> }
)

export const metadata = { title: '텍스트 추출' }

export default function Page() {
  return <OCRPage />
}
