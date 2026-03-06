'use client'

import { useState } from 'react'
import type { WidgetCatalogItem, WidgetType } from './services/widgetTypes'

const CATEGORY_LABELS: Record<string, string> = {
  monitoring: 'Monitoring',
  analytics: 'Analytics',
  management: 'Management',
  system: 'System',
}

const CATEGORY_ORDER = ['monitoring', 'analytics', 'management', 'system'] as const

const SIZE_LABELS: Record<string, string> = {
  sm: 'S',
  md: 'M',
  lg: 'L',
  xl: 'XL',
}

interface WidgetCatalogPanelProps {
  catalog: WidgetCatalogItem[]
  onAdd: (type: WidgetType) => void
}

export default function WidgetCatalogPanel({ catalog, onAdd }: WidgetCatalogPanelProps) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? catalog.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()),
      )
    : catalog

  const grouped = CATEGORY_ORDER.reduce<Record<string, WidgetCatalogItem[]>>((acc, cat) => {
    const items = filtered.filter((item) => item.category === cat)
    if (items.length > 0) {
      return { ...acc, [cat]: items }
    }
    return acc
  }, {})

  return (
    <aside className="w-72 shrink-0 flex flex-col gap-4 rounded-xl bg-admin-bg-card border border-admin-border p-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
      <h2 className="text-sm font-bold text-text-primary">위젯 추가</h2>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="위젯 검색..."
        className="w-full rounded-lg border border-admin-border bg-admin-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-primary transition-colors"
      />

      {/* Categories */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          {items.map((item) => (
            <div
              key={item.type}
              className="flex items-start gap-3 rounded-lg border border-admin-border p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <span className="text-lg leading-none mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {item.name}
                  </span>
                  <span className="shrink-0 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-semibold text-primary">
                    {SIZE_LABELS[item.defaultSize]}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAdd(item.type)}
                className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                추가
              </button>
            </div>
          ))}
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-sm text-text-secondary text-center py-4">검색 결과가 없습니다.</p>
      )}
    </aside>
  )
}
