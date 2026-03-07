/**
 * Alert Rule Engine Service
 */

import type { AlertRule, AlertHistory, AlertPreset } from './alertRuleTypes'

const STORAGE_KEY = 'hchat-alert-rules'
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_RULES: AlertRule[] = [
  {
    id: 'rule-1',
    name: 'API 오류율 급증',
    description: 'API 오류율이 5%를 초과할 때 알림',
    conditions: [{ metric: 'api_error_rate', operator: 'gt', value: 5, duration: 5 }],
    combinator: 'AND',
    severity: 'critical',
    channels: [
      { type: 'slack', target: '#ops-alerts', enabled: true },
      { type: 'email', target: 'ops@hchat.ai', enabled: true },
    ],
    enabled: true,
    cooldownMinutes: 15,
    triggerCount: 3,
    createdAt: '2026-02-01',
    lastTriggered: '2026-03-06',
    escalation: {
      levels: [
        {
          minutesAfterTrigger: 30,
          channels: [{ type: 'email', target: 'cto@hchat.ai', enabled: true }],
          notify: ['CTO'],
        },
      ],
    },
  },
  {
    id: 'rule-2',
    name: '일일 비용 초과',
    description: '일일 API 비용이 ₩500,000을 초과할 때',
    conditions: [{ metric: 'cost_daily', operator: 'gt', value: 500000 }],
    combinator: 'AND',
    severity: 'high',
    channels: [{ type: 'slack', target: '#cost-alerts', enabled: true }],
    enabled: true,
    cooldownMinutes: 60,
    triggerCount: 1,
    createdAt: '2026-02-15',
  },
  {
    id: 'rule-3',
    name: '응답 시간 지연',
    description: '평균 응답 시간이 5초를 초과할 때',
    conditions: [{ metric: 'response_time', operator: 'gt', value: 5000, duration: 10 }],
    combinator: 'AND',
    severity: 'medium',
    channels: [{ type: 'teams', target: 'AI Platform', enabled: true }],
    enabled: true,
    cooldownMinutes: 30,
    triggerCount: 7,
    createdAt: '2026-01-20',
    lastTriggered: '2026-03-07',
  },
  {
    id: 'rule-4',
    name: '사용량 급증',
    description: '활성 사용자가 전일 대비 50% 이상 증가할 때',
    conditions: [{ metric: 'usage_spike', operator: 'gt', value: 50 }],
    combinator: 'AND',
    severity: 'low',
    channels: [{ type: 'email', target: 'analytics@hchat.ai', enabled: true }],
    enabled: false,
    cooldownMinutes: 120,
    triggerCount: 0,
    createdAt: '2026-03-01',
  },
]

const MOCK_HISTORY: AlertHistory[] = [
  {
    id: 'ah-1',
    ruleId: 'rule-1',
    ruleName: 'API 오류율 급증',
    severity: 'critical',
    triggeredAt: '2026-03-06T14:30:00Z',
    resolvedAt: '2026-03-06T14:45:00Z',
    status: 'resolved',
    details: 'API 오류율 8.5% (임계값 5%)',
    notifiedChannels: ['slack', 'email'],
  },
  {
    id: 'ah-2',
    ruleId: 'rule-3',
    ruleName: '응답 시간 지연',
    severity: 'medium',
    triggeredAt: '2026-03-07T09:15:00Z',
    status: 'active',
    details: '평균 응답 시간 6.2초 (임계값 5초)',
    notifiedChannels: ['teams'],
  },
  {
    id: 'ah-3',
    ruleId: 'rule-2',
    ruleName: '일일 비용 초과',
    severity: 'high',
    triggeredAt: '2026-03-05T18:00:00Z',
    resolvedAt: '2026-03-06T00:00:00Z',
    status: 'resolved',
    details: '일일 비용 ₩620,000 (임계값 ₩500,000)',
    notifiedChannels: ['slack'],
  },
]

const PRESETS: AlertPreset[] = [
  {
    id: 'preset-error',
    name: 'API 오류율 경고',
    description: '오류율 5% 초과 시 알림',
    rule: {
      name: 'API 오류율 경고',
      description: 'API 오류율 임계값 초과',
      conditions: [{ metric: 'api_error_rate', operator: 'gt', value: 5 }],
      combinator: 'AND',
      severity: 'critical',
      channels: [{ type: 'slack', target: '#alerts', enabled: true }],
      enabled: true,
      cooldownMinutes: 15,
    },
  },
  {
    id: 'preset-cost',
    name: '비용 초과 경고',
    description: '일일 비용 한도 초과',
    rule: {
      name: '비용 초과 경고',
      description: '일일 비용 한도 초과',
      conditions: [{ metric: 'cost_daily', operator: 'gt', value: 500000 }],
      combinator: 'AND',
      severity: 'high',
      channels: [{ type: 'email', target: 'finance@company.com', enabled: true }],
      enabled: true,
      cooldownMinutes: 60,
    },
  },
  {
    id: 'preset-latency',
    name: '레이턴시 경고',
    description: '응답 지연 감지',
    rule: {
      name: '레이턴시 경고',
      description: '응답 시간 임계값 초과',
      conditions: [{ metric: 'response_time', operator: 'gt', value: 3000 }],
      combinator: 'AND',
      severity: 'medium',
      channels: [{ type: 'teams', target: 'DevOps', enabled: true }],
      enabled: true,
      cooldownMinutes: 30,
    },
  },
]

function getStoredRules(): AlertRule[] {
  if (typeof window === 'undefined') return MOCK_RULES
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : MOCK_RULES
  } catch {
    return MOCK_RULES
  }
}

function saveRules(rules: AlertRule[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
}

export async function getAlertRules(): Promise<AlertRule[]> {
  await delay(200)
  return getStoredRules()
}

export async function getAlertRuleById(id: string): Promise<AlertRule | null> {
  await delay(100)
  return getStoredRules().find((r) => r.id === id) ?? null
}

export async function createAlertRule(
  rule: Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>,
): Promise<AlertRule> {
  await delay(300)
  const rules = getStoredRules()
  const newRule: AlertRule = {
    ...rule,
    id: `rule-${Date.now()}`,
    createdAt: new Date().toISOString(),
    triggerCount: 0,
  }
  saveRules([...rules, newRule])
  return newRule
}

export async function updateAlertRule(
  id: string,
  updates: Partial<AlertRule>,
): Promise<AlertRule | null> {
  await delay(200)
  const rules = getStoredRules()
  let updated: AlertRule | null = null
  const newRules = rules.map((r) => {
    if (r.id !== id) return r
    updated = { ...r, ...updates, id: r.id, createdAt: r.createdAt }
    return updated
  })
  if (updated) saveRules(newRules)
  return updated
}

export async function deleteAlertRule(id: string): Promise<boolean> {
  await delay(200)
  const rules = getStoredRules()
  const filtered = rules.filter((r) => r.id !== id)
  if (filtered.length === rules.length) return false
  saveRules(filtered)
  return true
}

export async function toggleAlertRule(id: string): Promise<AlertRule | null> {
  const rules = getStoredRules()
  const rule = rules.find((r) => r.id === id)
  if (!rule) return null
  return updateAlertRule(id, { enabled: !rule.enabled })
}

export async function getAlertHistory(limit: number = 20): Promise<AlertHistory[]> {
  await delay(200)
  return MOCK_HISTORY.slice(0, limit)
}

export function getAlertPresets(): AlertPreset[] {
  return PRESETS
}
