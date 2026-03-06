'use client'

import { useCallback } from 'react'

export type DesktopNavItem =
  | 'chat'
  | 'group'
  | 'agent'
  | 'swarm'
  | 'debate'
  | 'tools'
  | 'image'
  | 'settings'

interface NavEntry {
  id: DesktopNavItem
  label: string
  abbr: string
}

const NAV_ITEMS: readonly NavEntry[] = [
  { id: 'chat', label: 'Chat', abbr: 'C' },
  { id: 'group', label: 'Group Chat', abbr: 'G' },
  { id: 'agent', label: 'Agent', abbr: 'A' },
  { id: 'swarm', label: 'Swarm', abbr: 'S' },
  { id: 'debate', label: 'Debate', abbr: 'D' },
  { id: 'tools', label: 'AI Tools', abbr: 'T' },
  { id: 'image', label: 'Image Gen', abbr: 'I' },
  { id: 'settings', label: 'Settings', abbr: 'X' },
] as const

export interface DesktopSidebarProps {
  activeItem: DesktopNavItem
  onItemClick: (item: DesktopNavItem) => void
  collapsed?: boolean
  userName?: string
  userEmail?: string
}

export default function DesktopSidebar({
  activeItem,
  onItemClick,
  collapsed = false,
  userName = 'User',
  userEmail,
}: DesktopSidebarProps) {
  const handleClick = useCallback(
    (item: DesktopNavItem) => () => {
      onItemClick(item)
    },
    [onItemClick],
  )

  return (
    <aside
      className={`flex flex-col h-full bg-[var(--dt-bg-sidebar)] transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--dt-primary)] text-white text-sm font-bold shrink-0">
          H
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-[var(--dt-text-sidebar-active)] truncate">
            H Chat Desktop
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={handleClick(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--dt-primary)] text-white'
                  : 'text-[var(--dt-text-sidebar)] hover:bg-[var(--dt-sidebar-hover)] hover:text-[var(--dt-text-sidebar-active)]'
              }`}
            >
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold shrink-0 ${
                  isActive ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                {item.abbr}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--dt-primary)] text-white text-xs font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--dt-text-sidebar-active)] truncate">
                {userName}
              </p>
              {userEmail && (
                <p className="text-xs text-[var(--dt-text-sidebar)] truncate">{userEmail}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
