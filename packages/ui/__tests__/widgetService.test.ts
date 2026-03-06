import { describe, it, expect, beforeEach } from 'vitest'
import {
  getWidgetCatalog,
  getActiveLayout,
  addWidget,
  removeWidget,
  updateWidgetPosition,
  updateWidgetSize,
  toggleWidgetVisibility,
  resetToDefault,
  createLayout,
  saveLayout,
} from '../src/admin/services/widgetService'

describe('widgetService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getWidgetCatalog returns 10 items', () => {
    const catalog = getWidgetCatalog()
    expect(catalog).toHaveLength(10)
    for (const item of catalog) {
      expect(item).toHaveProperty('type')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('category')
    }
  })

  it('getActiveLayout returns default layout', () => {
    const layout = getActiveLayout()
    expect(layout).toHaveProperty('id')
    expect(layout).toHaveProperty('name')
    expect(layout.widgets.length).toBeGreaterThan(0)
  })

  it('addWidget increases widget count', () => {
    const layout = getActiveLayout()
    const before = layout.widgets.length
    addWidget(layout.id, 'metric-card')
    const after = getActiveLayout().widgets.length
    expect(after).toBe(before + 1)
  })

  it('removeWidget decreases widget count', () => {
    const layout = getActiveLayout()
    const widgetId = layout.widgets[0].id
    const before = layout.widgets.length
    removeWidget(layout.id, widgetId)
    const after = getActiveLayout().widgets.length
    expect(after).toBe(before - 1)
  })

  it('updateWidgetPosition changes position', () => {
    const layout = getActiveLayout()
    const widgetId = layout.widgets[0].id
    updateWidgetPosition(layout.id, widgetId, { x: 5, y: 10 })
    const updated = getActiveLayout()
    const widget = updated.widgets.find((w) => w.id === widgetId)
    expect(widget?.position).toEqual({ x: 5, y: 10 })
  })

  it('updateWidgetSize changes size', () => {
    const layout = getActiveLayout()
    const widgetId = layout.widgets[0].id
    updateWidgetSize(layout.id, widgetId, 'xl')
    const updated = getActiveLayout()
    const widget = updated.widgets.find((w) => w.id === widgetId)
    expect(widget?.size).toBe('xl')
  })

  it('toggleWidgetVisibility flips visible', () => {
    const layout = getActiveLayout()
    const widgetId = layout.widgets[0].id
    const before = layout.widgets[0].visible
    toggleWidgetVisibility(layout.id, widgetId)
    const updated = getActiveLayout()
    const widget = updated.widgets.find((w) => w.id === widgetId)
    expect(widget?.visible).toBe(!before)
  })

  it('resetToDefault returns default layout', () => {
    const layout = getActiveLayout()
    addWidget(layout.id, 'bar-chart')
    addWidget(layout.id, 'donut-chart')
    const reset = resetToDefault()
    expect(reset.widgets.length).toBeLessThan(getActiveLayout().widgets.length + 3)
    expect(reset.id).toBe('layout-default')
  })

  it('createLayout creates a new empty layout', () => {
    const layout = createLayout('테스트 레이아웃')
    expect(layout.name).toBe('테스트 레이아웃')
    expect(layout.widgets).toHaveLength(0)
    expect(layout.id).not.toBe('layout-default')
  })

  it('saveLayout persists to localStorage', () => {
    const layout = getActiveLayout()
    saveLayout(layout)
    const raw = localStorage.getItem('hchat-dashboard-layouts')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.some((l: { id: string }) => l.id === layout.id)).toBe(true)
  })
})
