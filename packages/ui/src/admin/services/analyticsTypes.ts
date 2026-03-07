/**
 * Analytics Engine types — anomaly detection, prediction, auto-insights
 */

export interface TimeSeriesPoint {
  readonly date: string
  readonly value: number
}

export interface AnomalyResult {
  readonly date: string
  readonly value: number
  readonly expected: number
  readonly zscore: number
  readonly isAnomaly: boolean
  readonly type: 'spike' | 'drop' | 'normal'
}

export interface PredictionResult {
  readonly date: string
  readonly predicted: number
  readonly lowerBound: number
  readonly upperBound: number
}

export type InsightSeverity = 'info' | 'warning' | 'critical'
export type InsightCategory = 'usage' | 'cost' | 'performance' | 'adoption' | 'anomaly'

export interface AutoInsight {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly severity: InsightSeverity
  readonly category: InsightCategory
  readonly metric: string
  readonly change: number
  readonly changePercent: number
  readonly period: string
  readonly createdAt: string
  readonly actionable: boolean
  readonly suggestion?: string
}

export interface AnalyticsSummary {
  readonly anomalyCount: number
  readonly criticalInsights: number
  readonly predictionAccuracy: number
  readonly lastAnalyzed: string
}
