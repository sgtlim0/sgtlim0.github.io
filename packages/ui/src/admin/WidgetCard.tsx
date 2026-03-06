'use client'

import type { ReactNode } from 'react'
import type { WidgetConfig, WidgetSize } from './services/widgetTypes'
import { WIDGET_SIZE_MAP } from './services/widgetTypes'

const SIZE_LABELS: Record<WidgetSize, string> = {
  sm: 'S',
  md: 'M',
  lg: 'L',
  xl: 'XL',
}

const SIZE_CYCLE: WidgetSize[] = ['sm', 'md', 'lg', 'xl']

interface WidgetCardProps {
  widget: WidgetConfig
  editing?: boolean
  onRemove?: (id: string) => void
  onResize?: (id: string, size: WidgetSize) => void
  onToggle?: (id: string) => void
  children: ReactNode
}

export default function WidgetCard({
  widget,
  editing = false,
  onRemove,
  onResize,
  onToggle,
  children,
}: WidgetCardProps) {
  const { cols, rows } = WIDGET_SIZE_MAP[widget.size]

  const gridStyle = {
    gridColumn: `span ${cols}`,
    gridRow: `span ${rows}`,
  }

  const handleCycleSize = () => {
    if (!onResize) return
    const currentIndex = SIZE_CYCLE.indexOf(widget.size)
    const nextSize = SIZE_CYCLE[(currentIndex + 1) % SIZE_CYCLE.length]
    onResize(widget.id, nextSize)
  }

  return (
    <div
      style={gridStyle}
      className={[
        'relative flex flex-col rounded-xl bg-admin-bg-card border p-4 transition-all',
        editing ? 'border-dashed border-primary/60 hover:bg-primary/5' : 'border-admin-border',
        !widget.visible ? 'opacity-40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {editing && (
            <span className="cursor-grab text-text-secondary select-none text-sm leading-none">
              &#8286;&#8286;
            </span>
          )}
          <h3 className="text-sm font-bold text-text-primary truncate">{widget.title}</h3>
          <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {SIZE_LABELS[widget.size]}
          </span>
          {!widget.visible && (
            <span className="shrink-0 rounded bg-admin-status-error/10 px-1.5 py-0.5 text-[10px] font-semibold text-admin-status-error">
              숨김
            </span>
          )}
        </div>

        {editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCycleSize}
              className="rounded p-1 text-xs text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors"
              title="사이즈 변경"
            >
              ↔
            </button>
            {onToggle && (
              <button
                type="button"
                onClick={() => onToggle(widget.id)}
                className="rounded p-1 text-xs text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors"
                title={widget.visible ? '숨기기' : '보이기'}
              >
                {widget.visible ? '👁' : '👁‍🗨'}
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(widget.id)}
                className="rounded p-1 text-xs text-text-secondary hover:bg-admin-status-error/10 hover:text-admin-status-error transition-colors"
                title="삭제"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  )
}
