import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const MyPage = dynamic(
  () => import('@hchat/ui/user').then(m => ({ default: m.MyPage })),
  { loading: () => <SkeletonCard /> }
)

export const metadata = { title: '마이페이지' }

export default function Page() {
  return <MyPage />
}
