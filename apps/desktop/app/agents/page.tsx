import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const AgentsPage = dynamic(() => import('../../components/AgentsPage'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})

export const metadata = { title: '에이전트' }

export default function Page() {
  return <AgentsPage />
}
