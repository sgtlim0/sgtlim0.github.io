'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const SSOConfigPanel = dynamic(
  () => import('@hchat/ui/admin/SSOConfigPanel'),
  { loading: () => <SkeletonCard /> }
)

export default function SSOPage() {
  return <SSOConfigPanel />
}
