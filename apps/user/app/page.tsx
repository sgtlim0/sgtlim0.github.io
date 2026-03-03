import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const ChatPage = dynamic(
  () => import('@hchat/ui/user').then(m => ({ default: m.ChatPage })),
  { loading: () => <SkeletonCard /> }
)

export const metadata = { title: '업무 비서' }

export default function Page() {
  return <ChatPage />
}
