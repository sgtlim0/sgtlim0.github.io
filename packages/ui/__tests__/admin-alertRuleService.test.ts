import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getAlertRules', () => {
    it('should return default mock rules when localStorage is empty', async () => {
      const promise = getAlertRules()
      vi.advanceTimersByTime(300)
      const rules = await promise

      expect(rules.length).toBeGreaterThan(0)
      rules.forEach((r) => {
        expect(r).toHaveProperty('id')
        expect(r).toHaveProperty('name')
        expect(r).toHaveProperty('severity')
        expect(r).toHaveProperty('enabled')
        expect(r).toHaveProperty('channels')
      })
    })

    it('should return rules with severity levels', async () => {
      const promise = getAlertRules()
      vi.advanceTimersByTime(300)
      const rules = await promise

      const severities = rules.map((r) => r.severity)
      expect(severities).toContain('critical')
      expect(severities).toContain('high')
    })
  })

  describe('getAlertRuleById', () => {
    it('should return a rule by ID', async () => {
      const promise = getAlertRuleById('rule-1')
      vi.advanceTimersByTime(200)
      const rule = await promise

      expect(rule).not.toBeNull()
      expect(rule?.id).toBe('rule-1')
      expect(rule?.name).toBe('API 오류율 급증')
    })

    it('should return null for non-existent ID', async () => {
      const promise = getAlertRuleById('non-existent')
      vi.advanceTimersByTime(200)
      const rule = await promise

      expect(rule).toBeNull()
    })
  })

  describe('createAlertRule', () => {
    it('should create a new rule with generated id', async () => {
      const promise = createAlertRule({
        name: '테스트 규칙',
        description: '테스트용 규칙',
        conditions: [{ metric: 'test', operator: 'gt', value: 10 }],
        combinator: 'AND',
        severity: 'medium',
        channels: [{ type: 'email', target: 'test@test.com', enabled: true }],
        enabled: true,
        cooldownMinutes: 30,
      })
      vi.advanceTimersByTime(400)
      const newRule = await promise

      expect(newRule.id).toBeTruthy()
      expect(newRule.name).toBe('테스트 규칙')
      expect(newRule.triggerCount).toBe(0)
      expect(newRule.createdAt).toBeTruthy()
    })

    it('should persist new rule to localStorage', async () => {
      const promise = createAlertRule({
        name: '저장 테스트',
        description: '',
        conditions: [{ metric: 'test', operator: 'gt', value: 5 }],
        combinator: 'AND',
        severity: 'low',
        channels: [],
        enabled: true,
        cooldownMinutes: 10,
      })
      vi.advanceTimersByTime(400)
      await promise

      const stored = localStorage.getItem('hchat-alert-rules')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      const found = parsed.find((r: { name: string }) => r.name === '저장 테스트')
      expect(found).toBeDefined()
    })
  })

  describe('updateAlertRule', () => {
    it('should update an existing rule', async () => {
      const updatePromise = updateAlertRule('rule-1', { name: '수정된 규칙' })
      vi.advanceTimersByTime(300)
      const updated = await updatePromise

      expect(updated).not.toBeNull()
      expect(updated?.name).toBe('수정된 규칙')
      expect(updated?.id).toBe('rule-1')
    })

    it('should return null for non-existent rule', async () => {
      const updatePromise = updateAlertRule('non-existent', { name: 'test' })
      vi.advanceTimersByTime(300)
      const updated = await updatePromise

      expect(updated).toBeNull()
    })

    it('should preserve id and createdAt on update', async () => {
      const getPromise = getAlertRuleById('rule-1')
      vi.advanceTimersByTime(200)
      const original = await getPromise

      const updatePromise = updateAlertRule('rule-1', { severity: 'low' })
      vi.advanceTimersByTime(300)
      const updated = await updatePromise

      expect(updated?.id).toBe(original?.id)
      expect(updated?.createdAt).toBe(original?.createdAt)
    })
  })

  describe('deleteAlertRule', () => {
    it('should delete an existing rule and return true', async () => {
      const promise = deleteAlertRule('rule-1')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(true)
    })

    it('should return false for non-existent rule', async () => {
      const promise = deleteAlertRule('non-existent')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(false)
    })
  })

  describe('toggleAlertRule', () => {
    it('should toggle enabled state of a rule', async () => {
      const getPromise = getAlertRuleById('rule-1')
      vi.advanceTimersByTime(200)
      const original = await getPromise
      expect(original?.enabled).toBe(true)

      const togglePromise = toggleAlertRule('rule-1')
      vi.advanceTimersByTime(300)
      const toggled = await togglePromise

      expect(toggled).not.toBeNull()
      expect(toggled?.enabled).toBe(false)
    })

    it('should return null for non-existent rule', async () => {
      const promise = toggleAlertRule('non-existent')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeNull()
    })
  })

  describe('getAlertHistory', () => {
    it('should return alert history', async () => {
      const promise = getAlertHistory()
      vi.advanceTimersByTime(300)
      const history = await promise

      expect(history.length).toBeGreaterThan(0)
      history.forEach((h) => {
        expect(h).toHaveProperty('id')
        expect(h).toHaveProperty('ruleName')
        expect(h).toHaveProperty('severity')
        expect(h).toHaveProperty('status')
        expect(h).toHaveProperty('triggeredAt')
      })
    })

    it('should respect limit parameter', async () => {
      const promise = getAlertHistory(1)
      vi.advanceTimersByTime(300)
      const history = await promise

      expect(history).toHaveLength(1)
    })
  })

  describe('getAlertPresets', () => {
    it('should return preset templates', () => {
      const presets = getAlertPresets()
      expect(presets.length).toBeGreaterThan(0)
      presets.forEach((p) => {
        expect(p).toHaveProperty('id')
        expect(p).toHaveProperty('name')
        expect(p).toHaveProperty('description')
        expect(p).toHaveProperty('rule')
        expect(p.rule).toHaveProperty('severity')
      })
    })
  })
})
