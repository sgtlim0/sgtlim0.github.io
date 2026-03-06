'use client'

import { useState } from 'react'
import type { NodeCatalogItem, NodeType } from './services/workflowTypes'
import { NODE_TYPE_BG_COLORS } from './services/workflowTypes'

interface WorkflowNodeCatalogProps {
  readonly catalog: readonly NodeCatalogItem[]
  readonly onAddNode: (type: NodeType) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  'input-output': 'Input / Output',
  processing: 'Processing',
  control: 'Control',
}

const CATEGORY_ORDER = ['input-output', 'processing', 'control'] as const

export default function WorkflowNodeCatalog({ catalog, onAddNode }: WorkflowNodeCatalogProps) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? catalog.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()),
      )
    : [...catalog]

  const grouped = CATEGORY_ORDER.reduce<Record<string, NodeCatalogItem[]>>((acc, cat) => {
    const items = filtered.filter((item) => item.category === cat)
    if (items.length > 0) {
      return { ...acc, [cat]: items }
    }
    return acc
  }, {})

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-3 rounded-xl bg-admin-bg-card border border-admin-border p-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
      <h2 className="text-sm font-bold text-text-primary">노드 추가</h2>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="노드 검색..."
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
              className="flex items-start gap-2.5 rounded-lg border border-admin-border p-2.5 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold mt-0.5 ${NODE_TYPE_BG_COLORS[item.type]}`}
              >
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary block truncate">
                  {item.name}
                </span>
                <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAddNode(item.type)}
                className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors mt-0.5"
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
