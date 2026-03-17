'use client'

import { useState } from 'react'
import type { AlertRule, AlertHistory } from './services/alertRuleTypes'
import {
  getAlertRules,
  toggleAlertRule,
  getAlertHistory,
  getAlertPresets,
} from './services/alertRuleService'
import { useAsyncData } from '../hooks/useAsyncData'

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-red-100 text-red-700',
  acknowledged: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
}

interface AlertData {
  readonly rules: AlertRule[]
  readonly history: AlertHistory[]
}

export default function AlertRuleBuilder() {
  const { data, loading } = useAsyncData<AlertData>(async () => {
    const [rules, history] = await Promise.all([getAlertRules(), getAlertHistory()])
    return { rules, history }
  }, [])
  const [localRules, setLocalRules] = useState<AlertRule[] | null>(null)

  const rules = localRules ?? data?.rules ?? []
  const history = data?.history ?? []

  const handleToggle = async (id: string) => {
    await toggleAlertRule(id)
    const updated = await getAlertRules()
    setLocalRules(updated)
  }

  if (loading || !data)
    return <div className="p-8 text-center text-text-secondary">알림 규칙 로딩 중...</div>

  const presets = getAlertPresets()
  const activeAlerts = history.filter((h) => h.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">알림 규칙 엔진</h2>
          <p className="text-sm text-text-secondary mt-1">
            {rules.length}개 규칙 | {activeAlerts}건 활성 알림
          </p>
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 rounded-xl border bg-admin-bg-card ${rule.enabled ? 'border-border' : 'border-dashed border-border opacity-60'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(rule.id)}
                  className={`w-10 h-5 rounded-full transition-colors ${rule.enabled ? 'bg-admin-teal' : 'bg-bg-hover'}`}
                  role="switch"
                  aria-checked={rule.enabled}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
                <div>
                  <span className="text-sm font-semibold text-text-primary">{rule.name}</span>
                  <p className="text-xs text-text-secondary">{rule.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[rule.severity]}`}
                >
                  {rule.severity}
                </span>
                {rule.triggerCount > 0 && (
                  <span className="text-xs text-text-tertiary">{rule.triggerCount}회 발생</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {rule.channels
                .filter((c) => c.enabled)
                .map((c, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-admin-bg-section text-text-secondary"
                  >
                    {c.type}: {c.target}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Alert History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">알림 히스토리</h3>
        {history.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border-light bg-admin-bg-card"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[h.status]}`}
              >
                {h.status}
              </span>
              <span className="text-sm text-text-primary">{h.ruleName}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary">{h.details}</p>
              <p className="text-[10px] text-text-tertiary">
                {new Date(h.triggeredAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Presets */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">프리셋 템플릿</h3>
        <div className="grid grid-cols-3 gap-3">
          {presets.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-xl border border-dashed border-admin-teal/30 bg-admin-teal/5 cursor-pointer hover:bg-admin-teal/10"
            >
              <p className="text-sm font-medium text-admin-teal">{p.name}</p>
              <p className="text-xs text-text-secondary mt-1">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
