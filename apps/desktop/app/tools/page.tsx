'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const ToolsPage = dynamic(() => import('../../components/ToolsPage'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})

export default function Page() {
  return <ToolsPage />
}
