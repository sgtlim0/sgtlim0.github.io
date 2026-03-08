export interface AlertRule {
  id: string
  name: string
  metric: 'error_rate' | 'response_time' | 'cpu_usage' | 'memory_usage' | 'lcp' | 'fid' | 'cls'
  condition: 'gt' | 'lt' | 'eq'
  threshold: number
  channel: 'email' | 'slack' | 'webhook'
  enabled: boolean
}

export interface AlertEvent {
  ruleId: string
  metric: string
  value: number
  threshold: number
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
}

export const DEFAULT_ALERT_RULES: readonly AlertRule[] = [
  {
    id: 'err-rate',
    name: '에러율 임계치',
    metric: 'error_rate',
    condition: 'gt',
    threshold: 5,
    channel: 'slack',
    enabled: true,
  },
  {
    id: 'resp-time',
    name: '응답 시간 경고',
    metric: 'response_time',
    condition: 'gt',
    threshold: 3000,
    channel: 'email',
    enabled: true,
  },
  {
    id: 'lcp-poor',
    name: 'LCP 성능 저하',
    metric: 'lcp',
    condition: 'gt',
    threshold: 4000,
    channel: 'slack',
    enabled: true,
  },
  {
    id: 'cls-poor',
    name: 'CLS 레이아웃 이동',
    metric: 'cls',
    condition: 'gt',
    threshold: 0.25,
    channel: 'webhook',
    enabled: true,
  },
  {
    id: 'cpu-high',
    name: 'CPU 과부하',
    metric: 'cpu_usage',
    condition: 'gt',
    threshold: 90,
    channel: 'email',
    enabled: true,
  },
  {
    id: 'mem-high',
    name: '메모리 부족',
    metric: 'memory_usage',
    condition: 'gt',
    threshold: 85,
    channel: 'slack',
    enabled: true,
  },
] as const

/**
 * Severity multiplier thresholds relative to the rule threshold.
 * - critical: value exceeds threshold by 50% or more
 * - warning:  value exceeds threshold but by less than 50%
 * - info:     value equals threshold exactly (eq condition)
 */
const CRITICAL_MULTIPLIER = 1.5

export function getAlertSeverity(
  metric: string,
  value: number,
  threshold?: number,
): AlertEvent['severity'] {
  const rule = DEFAULT_ALERT_RULES.find((r) => r.metric === metric)
  const effectiveThreshold = threshold ?? rule?.threshold ?? 0

  if (effectiveThreshold === 0) return 'info'

  const ratio = value / effectiveThreshold
  if (ratio >= CRITICAL_MULTIPLIER) return 'critical'
  if (ratio > 1) return 'warning'
  return 'info'
}

function checkCondition(condition: AlertRule['condition'], value: number, threshold: number): boolean {
  switch (condition) {
    case 'gt':
      return value > threshold
    case 'lt':
      return value < threshold
    case 'eq':
      return value === threshold
    default:
      return false
  }
}

export function evaluateAlert(rule: AlertRule, currentValue: number): AlertEvent | null {
  if (!rule.enabled) return null

  const breached = checkCondition(rule.condition, currentValue, rule.threshold)
  if (!breached) return null

  return {
    ruleId: rule.id,
    metric: rule.metric,
    value: currentValue,
    threshold: rule.threshold,
    timestamp: new Date().toISOString(),
    severity: getAlertSeverity(rule.metric, currentValue, rule.threshold),
  }
}

export function evaluateAllRules(
  rules: readonly AlertRule[],
  metrics: Record<string, number>,
): AlertEvent[] {
  const events: AlertEvent[] = []

  for (const rule of rules) {
    const value = metrics[rule.metric]
    if (value === undefined) continue

    const event = evaluateAlert(rule, value)
    if (event) {
      events.push(event)
    }
  }

  return events
}

export function createAlertRule(partial: Omit<AlertRule, 'id'>): AlertRule {
  return {
    ...partial,
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }
}

export function updateAlertRule(rule: AlertRule, updates: Partial<Omit<AlertRule, 'id'>>): AlertRule {
  return { ...rule, ...updates }
}

export function toggleAlertRule(rule: AlertRule): AlertRule {
  return { ...rule, enabled: !rule.enabled }
}
