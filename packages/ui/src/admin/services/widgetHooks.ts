'use client'

/**
 * Widget Dashboard Hooks
 *
 * React hooks for managing dashboard widget layouts.
 * All state updates are immutable; changes are persisted to localStorage via widgetService.
 */

import { useState, useCallback, useMemo } from 'react'
import type {
  WidgetType,
  WidgetSize,
  WidgetConfig,
  DashboardLayout,
  WidgetCatalogItem,
} from './widgetTypes'
import {
  getWidgetCatalog,
  getActiveLayout,
  getLayouts as serviceGetLayouts,
  saveLayout as serviceSaveLayout,
  createLayout as serviceCreateLayout,
  deleteLayout as serviceDeleteLayout,
  setActiveLayout as serviceSetActiveLayout,
  addWidget as serviceAddWidget,
  removeWidget as serviceRemoveWidget,
  updateWidgetPosition as serviceUpdatePosition,
  updateWidgetSize as serviceUpdateSize,
  updateWidgetSettings as serviceUpdateSettings,
  toggleWidgetVisibility as serviceToggleVisibility,
  resetToDefault as serviceResetToDefault,
} from './widgetService'

/**
 * Hook for managing dashboard layout state and widget operations
 *
 * Provides the active layout, widget list, and all CRUD operations.
 * State is synced with localStorage on every mutation.
 */
export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(() => getActiveLayout())
  const [layouts, setLayouts] = useState<DashboardLayout[]>(() => serviceGetLayouts())
  const catalog = useMemo(() => getWidgetCatalog(), [])

  const refreshLayouts = useCallback(() => {
    setLayouts(serviceGetLayouts())
  }, [])

  const addWidget = useCallback(
    (widgetType: WidgetType): WidgetConfig => {
      const widget = serviceAddWidget(layout.id, widgetType)
      const updated = getActiveLayout()
      setLayout(updated)
      refreshLayouts()
      return widget
    },
    [layout.id, refreshLayouts],
  )

  const removeWidget = useCallback(
    (widgetId: string) => {
      serviceRemoveWidget(layout.id, widgetId)
      setLayout(getActiveLayout())
      refreshLayouts()
    },
    [layout.id, refreshLayouts],
  )

  const moveWidget = useCallback(
    (widgetId: string, position: { x: number; y: number }) => {
      serviceUpdatePosition(layout.id, widgetId, position)
      setLayout(getActiveLayout())
      refreshLayouts()
    },
    [layout.id, refreshLayouts],
  )

  const resizeWidget = useCallback(
    (widgetId: string, size: WidgetSize) => {
      serviceUpdateSize(layout.id, widgetId, size)
      setLayout(getActiveLayout())
      refreshLayouts()
    },
    [layout.id, refreshLayouts],
  )

  const updateSettings = useCallback(
    (widgetId: string, settings: Record<string, string | number | boolean>) => {
      serviceUpdateSettings(layout.id, widgetId, settings)
      setLayout(getActiveLayout())
      refreshLayouts()
    },
    [layout.id, refreshLayouts],
  )

  const toggleWidget = useCallback(
    (widgetId: string) => {
      serviceToggleVisibility(layout.id, widgetId)
      setLayout(getActiveLayout())
      refreshLayouts()
    },
    [layout.id, refreshLayouts],
  )

  const resetLayout = useCallback(() => {
    const reset = serviceResetToDefault()
    setLayout(reset)
    refreshLayouts()
  }, [refreshLayouts])

  const persistLayout = useCallback(() => {
    serviceSaveLayout(layout)
    refreshLayouts()
  }, [layout, refreshLayouts])

  const switchLayout = useCallback(
    (layoutId: string) => {
      serviceSetActiveLayout(layoutId)
      setLayout(getActiveLayout())
      refreshLayouts()
    },
    [refreshLayouts],
  )

  const createLayout = useCallback(
    (name: string): DashboardLayout => {
      const created = serviceCreateLayout(name)
      setLayout(created)
      refreshLayouts()
      return created
    },
    [refreshLayouts],
  )

  const deleteLayoutById = useCallback(
    (id: string) => {
      serviceDeleteLayout(id)
      setLayout(getActiveLayout())
      refreshLayouts()
    },
    [refreshLayouts],
  )

  const widgets = layout.widgets

  return {
    layout,
    widgets,
    catalog,
    addWidget,
    removeWidget,
    moveWidget,
    resizeWidget,
    updateSettings,
    toggleWidget,
    resetLayout,
    saveLayout: persistLayout,
    layouts,
    switchLayout,
    createLayout,
    deleteLayout: deleteLayoutById,
  }
}

/**
 * Hook for accessing the widget catalog grouped by category
 *
 * Returns the full catalog and a categorized map for rendering widget pickers.
 */
export function useWidgetCatalog() {
  const catalog = useMemo(() => getWidgetCatalog(), [])

  const categorized = useMemo(() => {
    const groups: Record<string, WidgetCatalogItem[]> = {}
    for (const item of catalog) {
      const key = item.category
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
    }
    return groups as Readonly<Record<string, readonly WidgetCatalogItem[]>>
  }, [catalog])

  return { catalog, categorized }
}
