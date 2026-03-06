'use client'

import type { MobileTab } from './types'

export interface MobileTabBarProps {
  activeTab: MobileTab
  onTabChange: (tab: MobileTab) => void
}

const tabs: Array<{ key: MobileTab; label: string; abbr: string }> = [
  { key: 'chat', label: 'Chat', abbr: 'C' },
  { key: 'assistants', label: 'Assistants', abbr: 'A' },
  { key: 'history', label: 'History', abbr: 'H' },
  { key: 'settings', label: 'Settings', abbr: 'S' },
]

export default function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border)] z-50">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className="relative flex-1 flex flex-col items-center gap-1 py-2 transition-colors"
            >
              {isActive && (
                <span className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b bg-[var(--primary)]" />
              )}
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isActive
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }`}
              >
                {tab.abbr}
              </span>
              <span
                className={`text-xs ${
                  isActive ? 'text-[var(--primary)] font-medium' : 'text-[var(--text-secondary)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
