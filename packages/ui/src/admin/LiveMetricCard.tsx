'use client'

import type { RealtimeMetric } from './services/realtimeTypes'

export interface LiveMetricCardProps {
  metric: RealtimeMetric
}

function getTrendColor(trend: RealtimeMetric['trend']): string {
  if (trend === 'up') return 'var(--success)'
  if (trend === 'down') return 'var(--danger)'
  return 'var(--text-secondary)'
}

function getTrendArrow(trend: RealtimeMetric['trend']): string {
  if (trend === 'up') return '\u2191'
  if (trend === 'down') return '\u2193'
  return '\u2192'
}

function formatValue(value: number, unit: string): string {
  if (unit === '%') return `${value.toFixed(1)}%`
  if (unit === 'ms') return `${value.toLocaleString()}ms`
  return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`
}

export function LiveMetricCard({ metric }: LiveMetricCardProps) {
  const trendColor = getTrendColor(metric.trend)

  return (
    <div
      className="flex flex-col gap-2 p-5 rounded-xl border shadow-sm transition-transform duration-300"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {metric.label}
      </span>

      <span
        className="text-2xl font-bold tabular-nums transition-all duration-300"
        style={{ color: 'var(--text-primary)' }}
      >
        {formatValue(metric.value, metric.unit)}
      </span>

      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold" style={{ color: trendColor }}>
          {getTrendArrow(metric.trend)}
        </span>
        <span className="text-xs font-medium tabular-nums" style={{ color: trendColor }}>
          {metric.changePercent > 0 ? '+' : ''}
          {metric.changePercent.toFixed(1)}%
        </span>
        <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>
          vs prev
        </span>
      </div>
    </div>
  )
}

export default LiveMetricCard
