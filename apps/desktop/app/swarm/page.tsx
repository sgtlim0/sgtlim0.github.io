import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const SwarmPage = dynamic(() => import('../../components/SwarmPage'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})

export const metadata = { title: '스웜' }

export default function Page() {
  return <SwarmPage />
}
