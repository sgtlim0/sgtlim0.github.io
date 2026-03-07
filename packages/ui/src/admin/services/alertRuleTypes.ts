/**
 * Alert Rule Engine types
 */

export type AlertConditionOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between'
export type AlertMetric =
  | 'api_error_rate'
  | 'response_time'
  | 'cost_daily'
  | 'usage_spike'
  | 'token_usage'
  | 'active_users'
export type AlertChannel = 'email' | 'slack' | 'teams' | 'webhook'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface AlertCondition {
  readonly metric: AlertMetric
  readonly operator: AlertConditionOperator
  readonly value: number
  readonly secondaryValue?: number
  readonly duration?: number
}

export interface AlertRule {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly conditions: AlertCondition[]
  readonly combinator: 'AND' | 'OR'
  readonly severity: AlertSeverity
  readonly channels: AlertChannelConfig[]
  readonly enabled: boolean
  readonly cooldownMinutes: number
  readonly escalation?: EscalationPolicy
  readonly createdAt: string
  readonly lastTriggered?: string
  readonly triggerCount: number
}

export interface AlertChannelConfig {
  readonly type: AlertChannel
  readonly target: string
  readonly enabled: boolean
}

export interface EscalationPolicy {
  readonly levels: EscalationLevel[]
}

export interface EscalationLevel {
  readonly minutesAfterTrigger: number
  readonly channels: AlertChannelConfig[]
  readonly notify: string[]
}

export interface AlertHistory {
  readonly id: string
  readonly ruleId: string
  readonly ruleName: string
  readonly severity: AlertSeverity
  readonly triggeredAt: string
  readonly resolvedAt?: string
  readonly status: 'active' | 'acknowledged' | 'resolved'
  readonly details: string
  readonly notifiedChannels: AlertChannel[]
}

export interface AlertPreset {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rule: Omit<AlertRule, 'id' | 'createdAt' | 'lastTriggered' | 'triggerCount'>
}
