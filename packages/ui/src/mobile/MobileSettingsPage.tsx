'use client'

import type { MobileSetting } from './types'

export interface MobileSettingsPageProps {
  settings: MobileSetting[]
  onUpdate: (id: string, value: boolean | string) => void
  userName?: string
  userEmail?: string
}

function groupBySection(settings: MobileSetting[]): Record<string, MobileSetting[]> {
  const groups: Record<string, MobileSetting[]> = {}
  for (const s of settings) {
    const list = groups[s.section] ?? []
    groups[s.section] = [...list, s]
  }
  return groups
}

export default function MobileSettingsPage({
  settings,
  onUpdate,
  userName = '사용자',
  userEmail = 'user@hchat.ai',
}: MobileSettingsPageProps) {
  const sections = groupBySection(settings)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Profile area */}
      <div className="flex items-center gap-3 px-4 py-5 bg-[var(--bg-card)] border-b border-[var(--border)]">
        <span className="w-14 h-14 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xl font-semibold">
          {userName.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-base font-medium text-[var(--text-primary)]">{userName}</p>
          <p className="text-sm text-[var(--text-secondary)]">{userEmail}</p>
        </div>
      </div>

      {/* Settings sections */}
      <div className="flex flex-col gap-2 p-4">
        {Object.entries(sections).map(([section, items]) => (
          <div
            key={section}
            className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden"
          >
            <h3 className="px-4 pt-3 pb-1 text-xs font-semibold text-[var(--text-secondary)] uppercase">
              {section}
            </h3>
            <div className="divide-y divide-[var(--border)]">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.type === 'toggle' && (
                    <button
                      type="button"
                      onClick={() => onUpdate(item.id, !item.value)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        item.value ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                      }`}
                      role="switch"
                      aria-checked={!!item.value}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          item.value ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  )}
                  {item.type === 'select' && (
                    <button
                      type="button"
                      onClick={() => onUpdate(item.id, String(item.value ?? ''))}
                      className="text-sm text-[var(--text-secondary)]"
                    >
                      {String(item.value ?? '')} →
                    </button>
                  )}
                  {item.type === 'link' && (
                    <button
                      type="button"
                      onClick={() => onUpdate(item.id, '')}
                      className="text-sm text-[var(--text-secondary)]"
                    >
                      →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
