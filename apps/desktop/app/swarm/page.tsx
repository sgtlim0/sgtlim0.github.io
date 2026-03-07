'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const SwarmPage = dynamic(() => import('../../components/SwarmPage'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})
