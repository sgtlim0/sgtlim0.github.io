'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const AuditLogViewer = dynamic(
  () => import('@hchat/ui/admin').then(m => ({ default: m.AuditLogViewer })),
  { loading: () => <SkeletonCard /> }
)

export default function AuditLogsPage() {
  return <AuditLogViewer />
}
