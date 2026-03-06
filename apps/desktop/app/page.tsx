import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const DesktopChatPage = dynamic(() => import('../components/DesktopChatPage'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})

export const metadata = { title: '채팅' }

export default function Page() {
  return <DesktopChatPage />
}
