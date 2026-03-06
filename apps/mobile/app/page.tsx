import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const MobileApp = dynamic(() => import('@hchat/ui/mobile').then((mod) => mod.MobileApp), {
  ssr: false,
  loading: () => <SkeletonCard />,
})

export const metadata = { title: 'H Chat Mobile' }

export default function Page() {
  return <MobileApp />
}
