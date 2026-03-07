'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const AgentsPage = dynamic(() => import('../../components/AgentsPage'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})
