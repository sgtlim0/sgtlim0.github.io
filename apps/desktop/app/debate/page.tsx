import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const DebatePage = dynamic(() => import('../../components/DebatePage'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})

export const metadata = { title: '토론' }

export default function Page() {
  return <DebatePage />
}
