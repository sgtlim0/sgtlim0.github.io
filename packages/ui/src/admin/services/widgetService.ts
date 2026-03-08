/**
 * Widget Layout Management Service
 *
 * Manages dashboard widget layouts with localStorage persistence.
 * Provides CRUD operations for layouts and widget configuration.
 * All mutations return new objects (immutable pattern).
 */

import type {
  WidgetType,
  WidgetSize,
  WidgetConfig,
  DashboardLayout,
  WidgetCatalogItem,
} from './widgetTypes'

// ============= Constants =============

const STORAGE_KEY_LAYOUTS = 'hchat-dashboard-layouts'
const STORAGE_KEY_ACTIVE = 'hchat-active-layout-id'

let idCounter = 0
function generateId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

// ============= Widget Catalog =============

export const WIDGET_CATALOG: readonly WidgetCatalogItem[] = [
  {
    type: 'metric-card',
    name: '핵심 지표 카드',
    description: '주요 KPI를 숫자와 추세로 표시합니다',
    icon: 'KPI',
    defaultSize: 'sm',
    minSize: 'sm',
    maxSize: 'md',
    category: 'monitoring',
  },
  {
    type: 'line-chart',
    name: '추세 라인 차트',
    description: '시간별 데이터 추세를 라인 차트로 표시합니다',
    icon: 'LN',
    defaultSize: 'md',
    minSize: 'md',
    maxSize: 'xl',
    category: 'analytics',
  },
  {
    type: 'bar-chart',
    name: '막대 차트',
    description: '비교 데이터를 막대 차트로 표시합니다',
    icon: 'BAR',
    defaultSize: 'md',
    minSize: 'md',
    maxSize: 'xl',
    category: 'analytics',
  },
  {
    type: 'donut-chart',
    name: '도넛 차트',
    description: '비율 데이터를 도넛 차트로 표시합니다',
    icon: 'DNT',
    defaultSize: 'sm',
    minSize: 'sm',
    maxSize: 'lg',
    category: 'analytics',
  },
  {
    type: 'activity-feed',
    name: '활동 피드',
    description: '최근 시스템 활동 로그를 실시간으로 표시합니다',
    icon: 'ACT',
    defaultSize: 'md',
    minSize: 'sm',
    maxSize: 'lg',
    category: 'monitoring',
  },
  {
    type: 'model-distribution',
    name: '모델 사용 분포',
    description: 'AI 모델별 사용량 분포를 표시합니다',
    icon: 'MDL',
    defaultSize: 'md',
    minSize: 'sm',
    maxSize: 'xl',
    category: 'analytics',
  },
  {
    type: 'notification-summary',
    name: '알림 요약',
    description: '미확인 알림과 중요 공지를 요약합니다',
    icon: 'NTF',
    defaultSize: 'sm',
    minSize: 'sm',
    maxSize: 'md',
    category: 'system',
  },
  {
    type: 'user-stats',
    name: '사용자 통계',
    description: '활성 사용자 수와 사용 패턴을 표시합니다',
    icon: 'USR',
    defaultSize: 'md',
    minSize: 'sm',
    maxSize: 'lg',
    category: 'management',
  },
  {
    type: 'quick-actions',
    name: '빠른 작업',
    description: '자주 사용하는 관리 작업 바로가기입니다',
    icon: 'QCK',
    defaultSize: 'sm',
    minSize: 'sm',
    maxSize: 'md',
    category: 'system',
  },
  {
    type: 'status-overview',
    name: '시스템 상태 개요',
    description: '전체 시스템 및 서비스 상태를 표시합니다',
    icon: 'STS',
    defaultSize: 'lg',
    minSize: 'md',
    maxSize: 'xl',
    category: 'monitoring',
  },
]

// ============= Default Layout =============

const DEFAULT_WIDGETS: readonly WidgetConfig[] = [
  {
    id: 'w-default-1',
    type: 'metric-card',
    title: '총 사용량',
    size: 'sm',
    position: { x: 0, y: 0 },
    visible: true,
  },
  {
    id: 'w-default-2',
    type: 'metric-card',
    title: '활성 사용자',
    size: 'sm',
    position: { x: 1, y: 0 },
    visible: true,
  },
  {
    id: 'w-default-3',
    type: 'line-chart',
    title: '사용량 추세',
    size: 'md',
    position: { x: 2, y: 0 },
    visible: true,
  },
  {
    id: 'w-default-4',
    type: 'activity-feed',
    title: '최근 활동',
    size: 'md',
    position: { x: 0, y: 1 },
    visible: true,
  },
  {
    id: 'w-default-5',
    type: 'model-distribution',
    title: '모델 분포',
    size: 'md',
    position: { x: 2, y: 1 },
    visible: true,
  },
  {
    id: 'w-default-6',
    type: 'notification-summary',
    title: '알림',
    size: 'sm',
    position: { x: 0, y: 2 },
    visible: true,
  },
]

const DEFAULT_LAYOUT: DashboardLayout = {
  id: 'layout-default',
  name: '기본 대시보드',
  widgets: DEFAULT_WIDGETS,
  columns: 4,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

// ============= Storage Helpers =============

function loadLayouts(): DashboardLayout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAYOUTS)
    if (!raw) return [DEFAULT_LAYOUT]
    const parsed = JSON.parse(raw) as DashboardLayout[]
    return parsed.length > 0 ? parsed : [DEFAULT_LAYOUT]
  } catch {
    return [DEFAULT_LAYOUT]
  }
}

function persistLayouts(layouts: readonly DashboardLayout[]): void {
  localStorage.setItem(STORAGE_KEY_LAYOUTS, JSON.stringify(layouts))
}

function loadActiveLayoutId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE) ?? DEFAULT_LAYOUT.id
  } catch {
    return DEFAULT_LAYOUT.id
  }
}

function persistActiveLayoutId(id: string): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE, id)
}

function updateLayoutInList(
  layouts: readonly DashboardLayout[],
  layoutId: string,
  updater: (layout: DashboardLayout) => DashboardLayout,
): DashboardLayout[] {
  return layouts.map((l) => (l.id === layoutId ? updater(l) : l))
}

// ============= Public API =============

/**
 * Returns the full widget catalog (all available widget types with metadata).
 * @returns Readonly array of WidgetCatalogItem
 */
export function getWidgetCatalog(): readonly WidgetCatalogItem[] {
  return WIDGET_CATALOG
}

/**
 * Loads all persisted dashboard layouts from localStorage.
 * Falls back to the default layout if none exist.
 * @returns Array of DashboardLayout objects
 */
export function getLayouts(): DashboardLayout[] {
  return loadLayouts()
}

/**
 * Returns the currently active dashboard layout.
 * Falls back to the first available layout if the active ID is not found.
 * @returns The active DashboardLayout
 */
export function getActiveLayout(): DashboardLayout {
  const layouts = loadLayouts()
  const activeId = loadActiveLayoutId()
  return layouts.find((l) => l.id === activeId) ?? layouts[0]
}

/**
 * Saves (creates or updates) a dashboard layout in localStorage.
 * Automatically updates the `updatedAt` timestamp.
 * @param layout - The layout to save
 */
export function saveLayout(layout: DashboardLayout): void {
  const layouts = loadLayouts()
  const updated = { ...layout, updatedAt: Date.now() }
  const exists = layouts.some((l) => l.id === layout.id)
  const next = exists
    ? layouts.map((l) => (l.id === layout.id ? updated : l))
    : [...layouts, updated]
  persistLayouts(next)
}

/**
 * Creates a new empty dashboard layout and sets it as the active layout.
 * @param name - Display name for the layout
 * @returns The newly created DashboardLayout
 */
export function createLayout(name: string): DashboardLayout {
  const layout: DashboardLayout = {
    id: generateId('layout'),
    name,
    widgets: [],
    columns: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const layouts = loadLayouts()
  persistLayouts([...layouts, layout])
  persistActiveLayoutId(layout.id)
  return layout
}

/**
 * Deletes a layout by ID. If the deleted layout was active, switches to the first remaining layout.
 * If no layouts remain, restores the default layout.
 * @param id - Layout ID to delete
 */
export function deleteLayout(id: string): void {
  const layouts = loadLayouts().filter((l) => l.id !== id)
  const next = layouts.length > 0 ? layouts : [DEFAULT_LAYOUT]
  persistLayouts(next)
  if (loadActiveLayoutId() === id) {
    persistActiveLayoutId(next[0].id)
  }
}

/**
 * Sets the active layout by persisting the layout ID.
 * @param id - Layout ID to activate
 */
export function setActiveLayout(id: string): void {
  persistActiveLayoutId(id)
}

/**
 * Adds a new widget to a layout using default settings from the widget catalog.
 * @param layoutId - Target layout ID
 * @param widgetType - Type of widget to add
 * @returns The newly created WidgetConfig
 */
export function addWidget(layoutId: string, widgetType: WidgetType): WidgetConfig {
  const catalogItem = WIDGET_CATALOG.find((c) => c.type === widgetType)
  const widget: WidgetConfig = {
    id: generateId('widget'),
    type: widgetType,
    title: catalogItem?.name ?? widgetType,
    size: catalogItem?.defaultSize ?? 'md',
    position: { x: 0, y: 0 },
    visible: true,
  }

  const layouts = loadLayouts()
  const updated = updateLayoutInList(layouts, layoutId, (l) => ({
    ...l,
    widgets: [...l.widgets, widget],
    updatedAt: Date.now(),
  }))
  persistLayouts(updated)
  return widget
}

/**
 * Removes a widget from a layout.
 * @param layoutId - Target layout ID
 * @param widgetId - ID of the widget to remove
 */
export function removeWidget(layoutId: string, widgetId: string): void {
  const layouts = loadLayouts()
  const updated = updateLayoutInList(layouts, layoutId, (l) => ({
    ...l,
    widgets: l.widgets.filter((w) => w.id !== widgetId),
    updatedAt: Date.now(),
  }))
  persistLayouts(updated)
}

/**
 * Updates the grid position of a widget within a layout.
 * @param layoutId - Target layout ID
 * @param widgetId - ID of the widget to reposition
 * @param position - New grid position {x, y}
 */
export function updateWidgetPosition(
  layoutId: string,
  widgetId: string,
  position: { x: number; y: number },
): void {
  const layouts = loadLayouts()
  const updated = updateLayoutInList(layouts, layoutId, (l) => ({
    ...l,
    widgets: l.widgets.map((w) => (w.id === widgetId ? { ...w, position } : w)),
    updatedAt: Date.now(),
  }))
  persistLayouts(updated)
}

/**
 * Updates the display size of a widget.
 * @param layoutId - Target layout ID
 * @param widgetId - ID of the widget to resize
 * @param size - New size ('sm' | 'md' | 'lg' | 'xl')
 */
export function updateWidgetSize(layoutId: string, widgetId: string, size: WidgetSize): void {
  const layouts = loadLayouts()
  const updated = updateLayoutInList(layouts, layoutId, (l) => ({
    ...l,
    widgets: l.widgets.map((w) => (w.id === widgetId ? { ...w, size } : w)),
    updatedAt: Date.now(),
  }))
  persistLayouts(updated)
}

/**
 * Merges new settings into a widget's existing settings.
 * @param layoutId - Target layout ID
 * @param widgetId - ID of the widget to configure
 * @param settings - Key-value pairs to merge into widget settings
 */
export function updateWidgetSettings(
  layoutId: string,
  widgetId: string,
  settings: Record<string, string | number | boolean>,
): void {
  const layouts = loadLayouts()
  const updated = updateLayoutInList(layouts, layoutId, (l) => ({
    ...l,
    widgets: l.widgets.map((w) =>
      w.id === widgetId ? { ...w, settings: { ...w.settings, ...settings } } : w,
    ),
    updatedAt: Date.now(),
  }))
  persistLayouts(updated)
}

/**
 * Toggles the visible flag of a widget (show/hide).
 * @param layoutId - Target layout ID
 * @param widgetId - ID of the widget to toggle
 */
export function toggleWidgetVisibility(layoutId: string, widgetId: string): void {
  const layouts = loadLayouts()
  const updated = updateLayoutInList(layouts, layoutId, (l) => ({
    ...l,
    widgets: l.widgets.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w)),
    updatedAt: Date.now(),
  }))
  persistLayouts(updated)
}

/**
 * Resets all layouts to the built-in default layout and activates it.
 * @returns The restored default DashboardLayout
 */
export function resetToDefault(): DashboardLayout {
  const now = Date.now()
  const layout: DashboardLayout = { ...DEFAULT_LAYOUT, updatedAt: now }
  persistLayouts([layout])
  persistActiveLayoutId(layout.id)
  return layout
}
