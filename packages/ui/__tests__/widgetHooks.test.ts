import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDashboardLayout, useWidgetCatalog } from '../src/admin/services/widgetHooks'

describe('useDashboardLayout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return initial layout', () => {
    const { result } = renderHook(() => useDashboardLayout())
    expect(result.current.layout).toBeDefined()
    expect(result.current.layout.id).toBeDefined()
    expect(result.current.layout.name).toBeDefined()
  })

  it('should return widgets array', () => {
    const { result } = renderHook(() => useDashboardLayout())
    expect(Array.isArray(result.current.widgets)).toBe(true)
  })

  it('should return catalog', () => {
    const { result } = renderHook(() => useDashboardLayout())
    expect(Array.isArray(result.current.catalog)).toBe(true)
    expect(result.current.catalog.length).toBeGreaterThan(0)
  })

  it('should add a widget', () => {
    const { result } = renderHook(() => useDashboardLayout())
    const initialCount = result.current.widgets.length

    act(() => {
      result.current.addWidget('metric-card')
    })

    expect(result.current.widgets.length).toBe(initialCount + 1)
  })

  it('should remove a widget', () => {
    const { result } = renderHook(() => useDashboardLayout())

    let widgetId: string
    act(() => {
      const widget = result.current.addWidget('metric-card')
      widgetId = widget.id
    })

    const countAfterAdd = result.current.widgets.length

    act(() => {
      result.current.removeWidget(widgetId!)
    })

    expect(result.current.widgets.length).toBe(countAfterAdd - 1)
  })

  it('should move a widget', () => {
    const { result } = renderHook(() => useDashboardLayout())

    let widgetId: string
    act(() => {
      const widget = result.current.addWidget('metric-card')
      widgetId = widget.id
    })

    act(() => {
      result.current.moveWidget(widgetId!, { x: 2, y: 3 })
    })

    const moved = result.current.widgets.find((w) => w.id === widgetId!)
    expect(moved?.position).toEqual({ x: 2, y: 3 })
  })

  it('should reset layout', () => {
    const { result } = renderHook(() => useDashboardLayout())

    act(() => {
      result.current.addWidget('metric-card')
      result.current.addWidget('line-chart')
    })

    act(() => {
      result.current.resetLayout()
    })

    expect(result.current.layout).toBeDefined()
  })

  it('should create a new layout', () => {
    const { result } = renderHook(() => useDashboardLayout())

    act(() => {
      result.current.createLayout('Test Layout')
    })

    expect(result.current.layout.name).toBe('Test Layout')
  })

  it('should return layouts list', () => {
    const { result } = renderHook(() => useDashboardLayout())
    expect(Array.isArray(result.current.layouts)).toBe(true)
  })

  it('should save and persist layout', () => {
    const { result } = renderHook(() => useDashboardLayout())

    act(() => {
      result.current.addWidget('metric-card')
      result.current.saveLayout()
    })

    // Re-render to verify persistence
    const { result: result2 } = renderHook(() => useDashboardLayout())
    expect(result2.current.widgets.length).toBeGreaterThan(0)
  })
})

describe('useWidgetCatalog', () => {
  it('should return catalog array', () => {
    const { result } = renderHook(() => useWidgetCatalog())
    expect(Array.isArray(result.current.catalog)).toBe(true)
    expect(result.current.catalog.length).toBeGreaterThan(0)
  })

  it('should return categorized map', () => {
    const { result } = renderHook(() => useWidgetCatalog())
    expect(typeof result.current.categorized).toBe('object')
    const categories = Object.keys(result.current.categorized)
    expect(categories.length).toBeGreaterThan(0)
  })

  it('should have items in each category', () => {
    const { result } = renderHook(() => useWidgetCatalog())
    for (const [, items] of Object.entries(result.current.categorized)) {
      expect(items.length).toBeGreaterThan(0)
    }
  })
})
