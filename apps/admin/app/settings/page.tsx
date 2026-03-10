'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard, ShortcutHelp, useShortcutHelp } from '@hchat/ui'
import { ProtectedRoute } from '@hchat/ui/admin/auth'

const AdminSettings = dynamic(
  () => import('@hchat/ui/admin/AdminSettings'),
  { loading: () => <SkeletonCard /> }
)

function SettingsContent() {
  const { isOpen, open, close, groups, query, setQuery } = useShortcutHelp()

  return (
    <>
      <AdminSettings />
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-4">
        <button
          onClick={open}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-hmg-bg-section text-text-secondary hover:text-text-primary hover:bg-hmg-bg-surface transition-colors border border-hmg-border"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-hmg-bg-surface text-xs font-mono border border-hmg-border">⌘</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-hmg-bg-surface text-xs font-mono border border-hmg-border">/</kbd>
          <span>키보드 단축키</span>
        </button>
      </div>
      <ShortcutHelp
        isOpen={isOpen}
        onClose={close}
        groups={groups}
        query={query}
        onQueryChange={setQuery}
      />
    </>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute minRole="admin">
      <SettingsContent />
    </ProtectedRoute>
  )
}
