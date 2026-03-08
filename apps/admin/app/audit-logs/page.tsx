'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const AuditLogViewer = dynamic(
  () => import('@hchat/ui/admin/AuditLogViewer'),
  { loading: () => <SkeletonCard /> }
)

export default function AuditLogsPage() {
  return <AuditLogViewer />
}
