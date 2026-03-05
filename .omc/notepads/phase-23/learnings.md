# Phase 23 - Dynamic Imports for Non-ROI Admin Pages

## Task Completed
Applied dynamic imports to 8 Admin app non-ROI pages:
1. departments/page.tsx - DepartmentManagement
2. audit-logs/page.tsx - AuditLogViewer
3. sso/page.tsx - SSOConfigPanel
4. providers/page.tsx - AdminProviderStatus
5. models/page.tsx - AdminModelPricing
6. prompts/page.tsx - AdminPromptLibrary
7. agents/page.tsx - AdminAgentMonitoring
8. features/page.tsx - AdminFeatureUsage

## Patterns Applied

### Pattern 1: Pages with metadata (Server Components)
```tsx
import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page Title' }

const Component = dynamic(
  () => import('@hchat/ui/admin').then(m => ({ default: m.Component })),
  { loading: () => <SkeletonCard /> }
)

export default function Page() {
  return (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  )
}
```

### Pattern 2: Client Components
```tsx
'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'

const Component = dynamic(
  () => import('@hchat/ui/admin').then(m => ({ default: m.Component })),
  { loading: () => <SkeletonCard /> }
)

export default function Page() {
  return <Component />
}
```

### Pattern 3: Protected Route with minRole
```tsx
import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin'

const Component = dynamic(
  () => import('@hchat/ui/admin').then(m => ({ default: m.Component })),
  { loading: () => <SkeletonCard /> }
)

export default function Page() {
  return (
    <ProtectedRoute minRole="admin">
      <Component />
    </ProtectedRoute>
  )
}
```

## Key Points
- Metadata export works fine with Server Components (no need for 'use client')
- Removed async from AgentsPage function (no longer needed)
- SkeletonCard provides loading state during component load
- No ssr: false needed (Server Components support dynamic imports)
- ProtectedRoute imported statically (always needed for auth check)

## Verification
- ESLint: All 8 files pass
- TypeScript: No type errors
- Build artifacts lint errors ignored (.next/ directory)
