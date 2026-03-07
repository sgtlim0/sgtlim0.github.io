/**
 * Analytics Service — anomaly detection, prediction, auto-insights
 *
 * Uses z-score for anomaly detection, linear regression for prediction,
 * and pattern matching for auto-insight generation.
 */

import type {
  TimeSeriesPoint,
  AnomalyResult,
  PredictionResult,
  AutoInsight,
  AnalyticsSummary,
} from './analyticsTypes'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function stdDev(values: number[]): number {
  const avg = mean(values)
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length
  const xMean = (n - 1) / 2
  const yMean = mean(values)
  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean)
    denominator += (i - xMean) ** 2
  }

  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = yMean - slope * xMean
  return { slope, intercept }
}

export function detectAnomalies(data: TimeSeriesPoint[], threshold: number = 2.0): AnomalyResult[] {
  if (data.length < 3)
    return data.map((d) => ({
      ...d,
      expected: d.value,
      zscore: 0,
      isAnomaly: false,
      type: 'normal' as const,
    }))

  const values = data.map((d) => d.value)
  const avg = mean(values)
  const sd = stdDev(values)

  return data.map((d) => {
    const zscore = sd !== 0 ? (d.value - avg) / sd : 0
    const isAnomaly = Math.abs(zscore) > threshold
    const type =
      zscore > threshold
        ? ('spike' as const)
        : zscore < -threshold
          ? ('drop' as const)
          : ('normal' as const)

    return {
      date: d.date,
      value: d.value,
      expected: Math.round(avg),
      zscore: Math.round(zscore * 100) / 100,
      isAnomaly,
      type,
    }
  })
}

export function predictFuture(data: TimeSeriesPoint[], periods: number = 7): PredictionResult[] {
  if (data.length < 2) return []

  const values = data.map((d) => d.value)
  const { slope, intercept } = linearRegression(values)
  const sd = stdDev(values)
  const n = values.length

  const predictions: PredictionResult[] = []
  const lastDate = new Date(data[data.length - 1].date)

  for (let i = 1; i <= periods; i++) {
    const predicted = Math.round(slope * (n + i - 1) + intercept)
    const confidence = 1.96 * sd * Math.sqrt(1 + 1 / n + (i - 1) ** 2 / (n * 12))
    const nextDate = new Date(lastDate)
    nextDate.setDate(nextDate.getDate() + i)

    predictions.push({
      date: nextDate.toISOString().split('T')[0],
      predicted: Math.max(0, predicted),
      lowerBound: Math.max(0, Math.round(predicted - confidence)),
      upperBound: Math.round(predicted + confidence),
    })
  }

  return predictions
}

export function generateInsights(data: TimeSeriesPoint[], metricName: string): AutoInsight[] {
  if (data.length < 7) return []

  const insights: AutoInsight[] = []
  const values = data.map((d) => d.value)
  const recent = values.slice(-7)
  const previous = values.slice(-14, -7)

  if (previous.length > 0) {
    const recentAvg = mean(recent)
    const previousAvg = mean(previous)
    const change = recentAvg - previousAvg
    const changePercent = previousAvg !== 0 ? (change / previousAvg) * 100 : 0

    if (Math.abs(changePercent) > 20) {
      insights.push({
        id: `insight-${Date.now()}-trend`,
        title: changePercent > 0 ? `${metricName} 급증 감지` : `${metricName} 급감 감지`,
        description: `지난 7일간 ${metricName}이(가) 전주 대비 ${Math.abs(Math.round(changePercent))}% ${changePercent > 0 ? '증가' : '감소'}했습니다.`,
        severity: Math.abs(changePercent) > 50 ? 'critical' : 'warning',
        category: 'usage',
        metric: metricName,
        change: Math.round(change),
        changePercent: Math.round(changePercent * 10) / 10,
        period: '7일',
        createdAt: new Date().toISOString(),
        actionable: true,
        suggestion:
          changePercent > 0
            ? '사용량 증가에 따른 인프라 확장을 검토하세요.'
            : '사용량 감소 원인을 파악하고 사용자 피드백을 수집하세요.',
      })
    }

    if (Math.abs(changePercent) <= 5) {
      insights.push({
        id: `insight-${Date.now()}-stable`,
        title: `${metricName} 안정 추세`,
        description: `${metricName}이(가) 안정적으로 유지되고 있습니다 (변동률 ${Math.abs(Math.round(changePercent))}%).`,
        severity: 'info',
        category: 'usage',
        metric: metricName,
        change: Math.round(change),
        changePercent: Math.round(changePercent * 10) / 10,
        period: '7일',
        createdAt: new Date().toISOString(),
        actionable: false,
      })
    }
  }

  const anomalies = detectAnomalies(data)
  const anomalyCount = anomalies.filter((a) => a.isAnomaly).length
  if (anomalyCount > 0) {
    insights.push({
      id: `insight-${Date.now()}-anomaly`,
      title: `${metricName} 이상치 ${anomalyCount}건 감지`,
      description: `최근 데이터에서 ${anomalyCount}건의 이상치가 발견되었습니다. 원인 분석이 필요합니다.`,
      severity: anomalyCount > 3 ? 'critical' : 'warning',
      category: 'anomaly',
      metric: metricName,
      change: anomalyCount,
      changePercent: 0,
      period: '전체',
      createdAt: new Date().toISOString(),
      actionable: true,
      suggestion: '이상치 발생 시점의 시스템 로그를 확인하세요.',
    })
  }

  return insights
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  await delay(200)
  return {
    anomalyCount: Math.floor(Math.random() * 5),
    criticalInsights: Math.floor(Math.random() * 3),
    predictionAccuracy: 85 + Math.floor(Math.random() * 10),
    lastAnalyzed: new Date().toISOString(),
  }
}

function generateMockTimeSeries(
  days: number,
  baseValue: number,
  volatility: number,
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = []
  const now = new Date()
  let value = baseValue

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    value = Math.max(0, value + (Math.random() - 0.5) * volatility)

    if (Math.random() < 0.05) {
      value *= 1.5 + Math.random()
    }

    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
    })
  }

  return points
}

export async function getMockAnalyticsData(): Promise<{
  apiCalls: TimeSeriesPoint[]
  tokenUsage: TimeSeriesPoint[]
  activeUsers: TimeSeriesPoint[]
  costData: TimeSeriesPoint[]
}> {
  await delay(300)
  return {
    apiCalls: generateMockTimeSeries(30, 5000, 800),
    tokenUsage: generateMockTimeSeries(30, 150000, 20000),
    activeUsers: generateMockTimeSeries(30, 2000, 200),
    costData: generateMockTimeSeries(30, 50000, 8000),
  }
}
