'use client'

import { useState } from 'react'

interface NavItem {
  readonly id: string
  readonly label: string
  readonly icon: string
  readonly href: string
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'chat', label: '채팅', icon: '💬', href: '/' },
  { id: 'agents', label: '에이전트', icon: '🤖', href: '/agents' },
  { id: 'swarm', label: '스웜', icon: '🐝', href: '/swarm' },
  { id: 'debate', label: '토론', icon: '⚔️', href: '/debate' },
  { id: 'tools', label: 'AI 도구', icon: '🔧', href: '/tools' },
] as const

export default function DesktopLayout({
  children,
  activeItem = 'chat',
}: Readonly<{
  children: React.ReactNode
  activeItem?: string
}>) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-60'
        } flex flex-col border-r border-dt-border bg-dt-sidebar transition-all duration-200`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          {!collapsed && <span className="text-lg font-bold text-dt-text">H Chat</span>}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded p-1 text-dt-text-secondary hover:bg-dt-border/30"
            aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activeItem === item.id
                  ? 'bg-dt-accent/10 font-medium text-dt-accent'
                  : 'text-dt-text-secondary hover:bg-dt-border/20 hover:text-dt-text'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="border-t border-dt-border p-3">
          {!collapsed && <p className="text-xs text-dt-text-secondary">H Chat Desktop v0.1.0</p>}
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
