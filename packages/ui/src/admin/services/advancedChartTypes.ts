/**
 * Advanced Data Visualization types (D3.js-ready)
 */

export interface ChartConfig {
  readonly id: string
  readonly type: ChartType
  readonly title: string
  readonly dataSource: string
  readonly width?: number
  readonly height?: number
  readonly animate: boolean
  readonly drilldown?: DrilldownConfig
  readonly exportFormats: ('png' | 'svg' | 'pdf')[]
}

export type ChartType =
  | 'treemap'
  | 'sankey'
  | 'heatmap-grid'
  | 'scatter'
  | 'bubble'
  | 'funnel'
  | 'gauge'
  | 'candlestick'

export interface DrilldownConfig {
  readonly enabled: boolean
  readonly levels: DrilldownLevel[]
}

export interface DrilldownLevel {
  readonly field: string
  readonly chartType: ChartType
  readonly label: string
}

export interface TreemapNode {
  readonly name: string
  readonly value: number
  readonly children?: TreemapNode[]
  readonly color?: string
}

export interface SankeyLink {
  readonly source: string
  readonly target: string
  readonly value: number
}

export interface SankeyData {
  readonly nodes: { id: string; name: string }[]
  readonly links: SankeyLink[]
}

export interface ScatterPoint {
  readonly x: number
  readonly y: number
  readonly label: string
  readonly size?: number
  readonly color?: string
  readonly group?: string
}

export interface FunnelStep {
  readonly label: string
  readonly value: number
  readonly percentage: number
  readonly color: string
}

export interface GaugeConfig {
  readonly value: number
  readonly min: number
  readonly max: number
  readonly label: string
  readonly thresholds: { value: number; color: string; label: string }[]
}
