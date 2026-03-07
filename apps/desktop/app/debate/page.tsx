'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const DebatePage = dynamic(() => import('../../components/DebatePage'), {
  ssr: false,
  loading: () => <SkeletonCard />,
})
