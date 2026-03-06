/**
 * Widget System Type Definitions
 *
 * Types for the customizable dashboard widget system.
 * Supports 10 widget types across 4 categories with configurable sizes and positions.
 */

export type WidgetType =
  | 'metric-card'
  | 'line-chart'
  | 'bar-chart'
  | 'donut-chart'
  | 'activity-feed'
  | 'model-distribution'
  | 'notification-summary'
  | 'user-stats'
  | 'quick-actions'
  | 'status-overview'

export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl'

export interface WidgetConfig {
  readonly id: string
  readonly type: WidgetType
  readonly title: string
  readonly size: WidgetSize
  readonly position: { readonly x: number; readonly y: number }
  readonly visible: boolean
  readonly settings?: Readonly<Record<string, string | number | boolean>>
}

export interface DashboardLayout {
  readonly id: string
  readonly name: string
  readonly widgets: readonly WidgetConfig[]
  readonly columns: number
  readonly createdAt: number
  readonly updatedAt: number
}

export interface WidgetCatalogItem {
  readonly type: WidgetType
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly defaultSize: WidgetSize
  readonly minSize: WidgetSize
  readonly maxSize: WidgetSize
  readonly category: 'monitoring' | 'analytics' | 'management' | 'system'
}

/** Size to grid span mapping */
export const WIDGET_SIZE_MAP: Readonly<
  Record<WidgetSize, { readonly cols: number; readonly rows: number }>
> = {
  sm: { cols: 1, rows: 1 },
  md: { cols: 2, rows: 1 },
  lg: { cols: 2, rows: 2 },
  xl: { cols: 4, rows: 2 },
}
