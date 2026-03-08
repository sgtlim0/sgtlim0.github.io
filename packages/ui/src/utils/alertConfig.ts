/**
 * Alert Configuration & Manager
 *
 * Provides alert rule evaluation, cooldown management, alert history,
 * and notification channel interfaces for production monitoring.
 * No external service dependencies — channels are interface-only.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

/** Metric data bag passed to AlertManager for evaluation. */
export interface MetricData {
  errorRate?: number
  responseTime?: number
  cpuUsage?: number
  memoryUsage?: number
  lcp?: number
  fid?: number
  cls?: number
  [key: string]: number | undefined
}

/** Notification channel abstraction (implement for Slack, PagerDuty, etc.). */
export interface NotificationChannel {
  readonly name: string
  send(event: AlertEvent): Promise<void>
}

/** Configuration for AlertManager. */
export interface AlertManagerConfig {
  rules?: readonly AlertRule[]
  defaultCooldownMs?: number
  maxHistorySize?: number
  channels?: Record<string, NotificationChannel>
}

// ---------------------------------------------------------------------------
// Default Rules
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Severity Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Condition Check
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Single-Rule Evaluation (stateless)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Rule CRUD (immutable)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Metric-key mapping (MetricData field → AlertRule metric string)
// ---------------------------------------------------------------------------

const METRIC_KEY_MAP: Record<string, string> = {
  errorRate: 'error_rate',
  responseTime: 'response_time',
  cpuUsage: 'cpu_usage',
  memoryUsage: 'memory_usage',
  lcp: 'lcp',
  fid: 'fid',
  cls: 'cls',
}

function metricDataToRecord(data: MetricData): Record<string, number> {
  const record: Record<string, number> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    const mappedKey = METRIC_KEY_MAP[key] ?? key
    record[mappedKey] = value
  }
  return record
}

// ---------------------------------------------------------------------------
// AlertManager — stateful alert engine with cooldown & history
// ---------------------------------------------------------------------------

const DEFAULT_COOLDOWN_MS = 60_000 // 1 minute
const DEFAULT_MAX_HISTORY = 200

export class AlertManager {
  private readonly rules: AlertRule[]
  private readonly defaultCooldownMs: number
  private readonly maxHistorySize: number
  private readonly channels: Record<string, NotificationChannel>
  private readonly history: AlertEvent[] = []
  private readonly lastFired: Map<string, number> = new Map()

  constructor(config: AlertManagerConfig = {}) {
    this.rules = [...(config.rules ?? DEFAULT_ALERT_RULES)]
    this.defaultCooldownMs = config.defaultCooldownMs ?? DEFAULT_COOLDOWN_MS
    this.maxHistorySize = config.maxHistorySize ?? DEFAULT_MAX_HISTORY
    this.channels = { ...(config.channels ?? {}) }
  }

  // ---- Rule management (immutable returns) --------------------------------

  getRules(): readonly AlertRule[] {
    return [...this.rules]
  }

  addRule(partial: Omit<AlertRule, 'id'>): AlertRule {
    const rule = createAlertRule(partial)
    this.rules.push(rule)
    return rule
  }

  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex((r) => r.id === ruleId)
    if (index === -1) return false
    this.rules.splice(index, 1)
    this.lastFired.delete(ruleId)
    return true
  }

  updateRule(ruleId: string, updates: Partial<Omit<AlertRule, 'id'>>): AlertRule | null {
    const index = this.rules.findIndex((r) => r.id === ruleId)
    if (index === -1) return null
    const updated = updateAlertRule(this.rules[index], updates)
    this.rules[index] = updated
    return updated
  }

  toggleRule(ruleId: string): AlertRule | null {
    const index = this.rules.findIndex((r) => r.id === ruleId)
    if (index === -1) return null
    const toggled = toggleAlertRule(this.rules[index])
    this.rules[index] = toggled
    return toggled
  }

  // ---- Channel management -------------------------------------------------

  registerChannel(name: string, channel: NotificationChannel): void {
    this.channels[name] = channel
  }

  // ---- Core: check alerts -------------------------------------------------

  /**
   * Evaluates all rules against the provided metrics.
   * Respects cooldown — a rule that fired within `defaultCooldownMs` is skipped.
   * Fires notification channels and records events in history.
   * @returns Array of newly triggered AlertEvents
   */
  checkAlerts(metrics: MetricData, now: number = Date.now()): AlertEvent[] {
    const record = metricDataToRecord(metrics)
    const triggered: AlertEvent[] = []

    for (const rule of this.rules) {
      const value = record[rule.metric]
      if (value === undefined) continue

      // Cooldown check
      const lastTime = this.lastFired.get(rule.id)
      if (lastTime !== undefined && now - lastTime < this.defaultCooldownMs) {
        continue
      }

      const event = evaluateAlert(rule, value)
      if (event) {
        this.lastFired.set(rule.id, now)
        this.pushHistory(event)
        triggered.push(event)

        // Fire notification channel (best-effort, non-blocking)
        const channel = this.channels[rule.channel]
        if (channel) {
          channel.send(event).catch(() => {
            // Notification failure should not break monitoring
          })
        }
      }
    }

    return triggered
  }

  // ---- History management -------------------------------------------------

  getAlertHistory(): readonly AlertEvent[] {
    return [...this.history]
  }

  clearAlert(ruleId: string): boolean {
    const sizeBefore = this.history.length
    const remaining = this.history.filter((e) => e.ruleId !== ruleId)
    this.history.length = 0
    this.history.push(...remaining)
    this.lastFired.delete(ruleId)
    return this.history.length < sizeBefore
  }

  clearAllHistory(): void {
    this.history.length = 0
    this.lastFired.clear()
  }

  // ---- Internal -----------------------------------------------------------

  private pushHistory(event: AlertEvent): void {
    if (this.history.length >= this.maxHistorySize) {
      this.history.shift()
    }
    this.history.push(event)
  }
}
