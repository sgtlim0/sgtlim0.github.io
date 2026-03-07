'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const DesktopChatPage = dynamic(() => import('../components/DesktopChatPage'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})
