import { describe, it, expect, beforeEach } from 'vitest'
import {
  getWidgetCatalog,
  getLayouts,
  getActiveLayout,
  saveLayout,
  createLayout,
  deleteLayout,
  setActiveLayout,
  addWidget,
  removeWidget,
  updateWidgetPosition,
  updateWidgetSize,
  updateWidgetSettings,
  toggleWidgetVisibility,
  resetToDefault,
  WIDGET_CATALOG,
} from '../src/admin/services/widgetService'

describe('widgetService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getWidgetCatalog', () => {
    it('should return widget catalog', () => {
      const catalog = getWidgetCatalog()
      expect(catalog.length).toBeGreaterThan(0)
      catalog.forEach((item) => {
        expect(item).toHaveProperty('type')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('description')
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('defaultSize')
        expect(item).toHaveProperty('category')
      })
    })

    it('should include various widget types', () => {
      const catalog = getWidgetCatalog()
      const types = catalog.map((c) => c.type)
      expect(types).toContain('metric-card')
      expect(types).toContain('line-chart')
      expect(types).toContain('activity-feed')
    })
  })

  describe('getLayouts', () => {
    it('should return default layout when localStorage is empty', () => {
      const layouts = getLayouts()
      expect(layouts.length).toBeGreaterThan(0)
      expect(layouts[0].name).toBe('기본 대시보드')
    })
  })

  describe('getActiveLayout', () => {
    it('should return default layout initially', () => {
      const layout = getActiveLayout()
      expect(layout).toBeDefined()
      expect(layout.name).toBe('기본 대시보드')
      expect(layout.widgets.length).toBeGreaterThan(0)
    })
  })

  describe('createLayout', () => {
    it('should create a new empty layout', () => {
      const layout = createLayout('테스트 레이아웃')

      expect(layout.id).toBeTruthy()
      expect(layout.name).toBe('테스트 레이아웃')
      expect(layout.widgets).toEqual([])
      expect(layout.columns).toBe(4)
    })

    it('should set new layout as active', () => {
      const layout = createLayout('새 레이아웃')
      const active = getActiveLayout()

      expect(active.id).toBe(layout.id)
    })

    it('should persist to localStorage', () => {
      createLayout('저장 테스트')
      const layouts = getLayouts()
      const found = layouts.find((l) => l.name === '저장 테스트')
      expect(found).toBeDefined()
    })
  })

  describe('saveLayout', () => {
    it('should update existing layout', () => {
      const layout = getActiveLayout()
      const updated = { ...layout, name: '수정된 레이아웃' }
      saveLayout(updated)

      const saved = getLayouts().find((l) => l.id === layout.id)
      expect(saved?.name).toBe('수정된 레이아웃')
    })

    it('should add new layout if not exists', () => {
      const newLayout = {
        id: 'custom-layout',
        name: '커스텀',
        widgets: [],
        columns: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      saveLayout(newLayout)

      const layouts = getLayouts()
      const found = layouts.find((l) => l.id === 'custom-layout')
      expect(found).toBeDefined()
    })
  })

  describe('deleteLayout', () => {
    it('should delete a layout', () => {
      const layout = createLayout('삭제할 레이아웃')
      deleteLayout(layout.id)

      const layouts = getLayouts()
      const found = layouts.find((l) => l.id === layout.id)
      expect(found).toBeUndefined()
    })

    it('should keep at least one default layout', () => {
      const layouts = getLayouts()
      layouts.forEach((l) => deleteLayout(l.id))

      const remaining = getLayouts()
      expect(remaining.length).toBeGreaterThan(0)
    })
  })

  describe('setActiveLayout', () => {
    it('should change active layout', () => {
      const layout = createLayout('Another Layout')
      const defaultLayout = getLayouts().find((l) => l.name === '기본 대시보드')!
      setActiveLayout(defaultLayout.id)

      const active = getActiveLayout()
      expect(active.id).toBe(defaultLayout.id)
    })
  })

  describe('addWidget', () => {
    it('should add a widget to layout', () => {
      const layout = getActiveLayout()
      const widget = addWidget(layout.id, 'metric-card')

      expect(widget.id).toBeTruthy()
      expect(widget.type).toBe('metric-card')
      expect(widget.visible).toBe(true)
      expect(widget.title).toBe('핵심 지표 카드')
    })

    it('should use default size from catalog', () => {
      const layout = getActiveLayout()
      const widget = addWidget(layout.id, 'line-chart')

      const catalogItem = WIDGET_CATALOG.find((c) => c.type === 'line-chart')
      expect(widget.size).toBe(catalogItem?.defaultSize)
    })
  })

  describe('removeWidget', () => {
    it('should remove a widget from layout', () => {
      const layout = getActiveLayout()
      const widget = addWidget(layout.id, 'metric-card')
      removeWidget(layout.id, widget.id)

      const updatedLayout = getActiveLayout()
      const found = updatedLayout.widgets.find((w) => w.id === widget.id)
      expect(found).toBeUndefined()
    })
  })

  describe('updateWidgetPosition', () => {
    it('should update widget position', () => {
      const layout = getActiveLayout()
      const widget = addWidget(layout.id, 'bar-chart')
      updateWidgetPosition(layout.id, widget.id, { x: 5, y: 10 })

      const updatedLayout = getActiveLayout()
      const updated = updatedLayout.widgets.find((w) => w.id === widget.id)
      expect(updated?.position).toEqual({ x: 5, y: 10 })
    })
  })

  describe('updateWidgetSize', () => {
    it('should update widget size', () => {
      const layout = getActiveLayout()
      const widget = addWidget(layout.id, 'donut-chart')
      updateWidgetSize(layout.id, widget.id, 'lg')

      const updatedLayout = getActiveLayout()
      const updated = updatedLayout.widgets.find((w) => w.id === widget.id)
      expect(updated?.size).toBe('lg')
    })
  })

  describe('updateWidgetSettings', () => {
    it('should update widget settings', () => {
      const layout = getActiveLayout()
      const widget = addWidget(layout.id, 'metric-card')
      updateWidgetSettings(layout.id, widget.id, { refreshInterval: 5000, showTrend: true })

      const updatedLayout = getActiveLayout()
      const updated = updatedLayout.widgets.find((w) => w.id === widget.id)
      expect(updated?.settings?.refreshInterval).toBe(5000)
      expect(updated?.settings?.showTrend).toBe(true)
    })
  })

  describe('toggleWidgetVisibility', () => {
    it('should toggle widget visibility', () => {
      const layout = getActiveLayout()
      const widget = addWidget(layout.id, 'activity-feed')
      expect(widget.visible).toBe(true)

      toggleWidgetVisibility(layout.id, widget.id)
      let updatedLayout = getActiveLayout()
      let toggled = updatedLayout.widgets.find((w) => w.id === widget.id)
      expect(toggled?.visible).toBe(false)

      toggleWidgetVisibility(layout.id, widget.id)
      updatedLayout = getActiveLayout()
      toggled = updatedLayout.widgets.find((w) => w.id === widget.id)
      expect(toggled?.visible).toBe(true)
    })
  })

  describe('resetToDefault', () => {
    it('should reset to default layout', () => {
      createLayout('Custom 1')
      createLayout('Custom 2')

      const reset = resetToDefault()
      expect(reset.name).toBe('기본 대시보드')

      const layouts = getLayouts()
      expect(layouts).toHaveLength(1)
    })
  })
})
