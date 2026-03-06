'use client'

import { useState } from 'react'
import { useDashboardLayout } from './services/widgetHooks'
import WidgetCard from './WidgetCard'
import WidgetCatalogPanel from './WidgetCatalogPanel'
import WidgetRenderer from './WidgetRenderer'

export default function CustomDashboard() {
  const {
    layout,
    widgets,
    catalog,
    addWidget,
    removeWidget,
    resizeWidget,
    toggleWidget,
    resetLayout,
    saveLayout,
    layouts,
    switchLayout,
    createLayout,
    deleteLayout,
  } = useDashboardLayout()

  const [editing, setEditing] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)

  const visibleWidgets = editing ? widgets : widgets.filter((w) => w.visible)

  const handleCreateLayout = () => {
    const name = `레이아웃 ${layouts.length + 1}`
    createLayout(name)
    setEditing(true)
    setShowCatalog(true)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">대시보드 커스터마이징</h1>
          <p className="text-sm text-text-secondary mt-1">
            {layout.name} — 위젯 {widgets.length}개{editing ? ' (편집 중)' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Layout selector */}
          <select
            value={layout.id}
            onChange={(e) => switchLayout(e.target.value)}
            className="rounded-lg border border-admin-border bg-admin-bg-section px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
          >
            {layouts.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCreateLayout}
            className="rounded-lg border border-admin-border px-3 py-2 text-sm text-text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
          >
            + 새 레이아웃
          </button>

          {editing ? (
            <>
              <button
                type="button"
                onClick={() => setShowCatalog((prev) => !prev)}
                className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                {showCatalog ? '카탈로그 닫기' : '위젯 추가'}
              </button>
              <button
                type="button"
                onClick={resetLayout}
                className="rounded-lg border border-admin-status-error/40 px-3 py-2 text-sm text-admin-status-error hover:bg-admin-status-error/10 transition-colors"
              >
                초기화
              </button>
              {layouts.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    deleteLayout(layout.id)
                    setEditing(false)
                  }}
                  className="rounded-lg border border-admin-status-error/40 px-3 py-2 text-sm text-admin-status-error hover:bg-admin-status-error/10 transition-colors"
                >
                  삭제
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  saveLayout()
                  setEditing(false)
                  setShowCatalog(false)
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                저장
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              편집
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6">
        {/* Widget Grid */}
        <div className="flex-1 grid grid-cols-4 auto-rows-[140px] gap-4">
          {visibleWidgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              editing={editing}
              onRemove={editing ? removeWidget : undefined}
              onResize={editing ? resizeWidget : undefined}
              onToggle={editing ? toggleWidget : undefined}
            >
              <WidgetRenderer type={widget.type} settings={widget.settings} />
            </WidgetCard>
          ))}

          {visibleWidgets.length === 0 && (
            <div className="col-span-4 flex flex-col items-center justify-center gap-3 py-16 text-text-secondary">
              <span className="text-4xl">&#9776;</span>
              <p className="text-sm">위젯이 없습니다. 카탈로그에서 위젯을 추가하세요.</p>
            </div>
          )}
        </div>

        {/* Catalog Sidebar */}
        {editing && showCatalog && (
          <WidgetCatalogPanel catalog={[...catalog]} onAdd={(type) => addWidget(type)} />
        )}
      </div>
    </div>
  )
}
