/**
 * Real-time Dashboard Types
 *
 * Type definitions for the real-time data streaming service
 * used by the Admin dashboard for live metrics, activities, and stats.
 */

export interface RealtimeMetric {
  id: string
  label: string
  value: number
  previousValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

export interface RealtimeDataPoint {
  timestamp: number
  value: number
}

export interface RealtimeActivity {
  id: string
  type: 'query' | 'login' | 'error' | 'model_switch' | 'upload'
  user: string
  message: string
  timestamp: number
}

export interface RealtimeStats {
  activeUsers: number
  queriesPerMinute: number
  avgResponseTime: number
  errorRate: number
  totalTokensUsed: number
  modelDistribution: { model: string; count: number; percentage: number }[]
}

export interface RealtimeSubscription {
  unsubscribe: () => void
}
