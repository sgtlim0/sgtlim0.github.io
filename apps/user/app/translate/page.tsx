import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const TranslationPage = dynamic(
  () => import('@hchat/ui/user').then(m => ({ default: m.TranslationPage })),
  { loading: () => <SkeletonCard /> }
)

export const metadata = { title: '문서 번역' }

export default function Page() {
  return <TranslationPage />
}
