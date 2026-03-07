import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAlertRules,
  getAlertRuleById,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  toggleAlertRule,
  getAlertHistory,
  getAlertPresets,
} from '../src/admin/services/alertRuleService'

describe('alertRuleService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return default rules', async () => {
    const rules = await getAlertRules()
    expect(rules.length).toBe(4)
  })

  it('should get rule by id', async () => {
    const rule = await getAlertRuleById('rule-1')
    expect(rule).not.toBeNull()
    expect(rule!.name).toBe('API 오류율 급증')
    expect(rule!.severity).toBe('critical')
  })

  it('should return null for invalid id', async () => {
    const rule = await getAlertRuleById('nonexistent')
    expect(rule).toBeNull()
  })

  it('should create a rule', async () => {
    const rule = await createAlertRule({
      name: 'Test Rule',
      description: 'test',
      conditions: [{ metric: 'api_error_rate', operator: 'gt', value: 10 }],
      combinator: 'AND',
      severity: 'low',
      channels: [],
      enabled: true,
      cooldownMinutes: 30,
    })
    expect(rule.id).toMatch(/^rule-/)
    expect(rule.triggerCount).toBe(0)
  })

  it('should update a rule', async () => {
    const updated = await updateAlertRule('rule-1', { enabled: false })
    expect(updated).not.toBeNull()
    expect(updated!.enabled).toBe(false)
  })

  it('should delete a rule', async () => {
    const result = await deleteAlertRule('rule-4')
    expect(result).toBe(true)
    const rules = await getAlertRules()
    expect(rules.length).toBe(3)
  })

  it('should toggle rule enabled state', async () => {
    const toggled = await toggleAlertRule('rule-4')
    expect(toggled).not.toBeNull()
    expect(toggled!.enabled).toBe(true) // was false
  })

  it('should return alert history', async () => {
    const history = await getAlertHistory()
    expect(history.length).toBeGreaterThan(0)
    expect(history[0].status).toMatch(/active|acknowledged|resolved/)
  })

  it('should return presets', () => {
    const presets = getAlertPresets()
    expect(presets.length).toBe(3)
    presets.forEach((p) => {
      expect(p.rule.conditions.length).toBeGreaterThan(0)
    })
  })
})
