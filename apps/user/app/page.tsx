import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import ChatWithRecovery from './ChatWithRecovery'

const ChatPage = dynamic(
  () => import('@hchat/ui/user').then(m => ({ default: m.ChatPage })),
  { loading: () => <SkeletonCard /> }
)

export const metadata = { title: '업무 비서' }

export default function Page() {
  return <ChatWithRecovery><ChatPage /></ChatWithRecovery>
}
