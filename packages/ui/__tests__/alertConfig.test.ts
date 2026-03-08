import { describe, it, expect } from 'vitest'
import {
  evaluateAlert,
  evaluateAllRules,
  getAlertSeverity,
  createAlertRule,
  updateAlertRule,
  toggleAlertRule,
  DEFAULT_ALERT_RULES,
  type AlertRule,
} from '../src/utils/alertConfig'

describe('alertConfig', () => {
  describe('DEFAULT_ALERT_RULES', () => {
    it('should have 6 default rules', () => {
      expect(DEFAULT_ALERT_RULES).toHaveLength(6)
    })

    it('should have unique IDs for all rules', () => {
      const ids = DEFAULT_ALERT_RULES.map((r) => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have all rules enabled by default', () => {
      DEFAULT_ALERT_RULES.forEach((rule) => {
        expect(rule.enabled).toBe(true)
      })
    })

    it('should have valid threshold values (positive numbers)', () => {
      DEFAULT_ALERT_RULES.forEach((rule) => {
        expect(rule.threshold).toBeGreaterThan(0)
      })
    })
  })

  describe('evaluateAlert', () => {
    const baseRule: AlertRule = {
      id: 'test-gt',
      name: 'Test GT Rule',
      metric: 'error_rate',
      condition: 'gt',
      threshold: 5,
      channel: 'slack',
      enabled: true,
    }

    it('should return AlertEvent when gt condition is breached', () => {
      const result = evaluateAlert(baseRule, 10)
      expect(result).not.toBeNull()
      expect(result?.ruleId).toBe('test-gt')
      expect(result?.metric).toBe('error_rate')
      expect(result?.value).toBe(10)
      expect(result?.threshold).toBe(5)
    })

    it('should return null when gt condition is NOT breached', () => {
      const result = evaluateAlert(baseRule, 3)
      expect(result).toBeNull()
    })

    it('should return null when value equals threshold for gt condition', () => {
      const result = evaluateAlert(baseRule, 5)
      expect(result).toBeNull()
    })

    it('should evaluate lt condition correctly', () => {
      const ltRule: AlertRule = { ...baseRule, id: 'test-lt', condition: 'lt', threshold: 10 }
      expect(evaluateAlert(ltRule, 5)).not.toBeNull()
      expect(evaluateAlert(ltRule, 15)).toBeNull()
      expect(evaluateAlert(ltRule, 10)).toBeNull()
    })

    it('should evaluate eq condition correctly', () => {
      const eqRule: AlertRule = { ...baseRule, id: 'test-eq', condition: 'eq', threshold: 5 }
      expect(evaluateAlert(eqRule, 5)).not.toBeNull()
      expect(evaluateAlert(eqRule, 4)).toBeNull()
      expect(evaluateAlert(eqRule, 6)).toBeNull()
    })

    it('should return null for disabled rules', () => {
      const disabledRule: AlertRule = { ...baseRule, enabled: false }
      const result = evaluateAlert(disabledRule, 100)
      expect(result).toBeNull()
    })

    it('should include a valid ISO timestamp', () => {
      const result = evaluateAlert(baseRule, 10)
      expect(result?.timestamp).toBeDefined()
      const parsed = new Date(result!.timestamp)
      expect(parsed.toISOString()).toBe(result!.timestamp)
    })

    it('should set severity based on how far over threshold', () => {
      // Value just over threshold -> warning
      const warning = evaluateAlert(baseRule, 6)
      expect(warning?.severity).toBe('warning')

      // Value far over threshold (1.5x+) -> critical
      const critical = evaluateAlert(baseRule, 8)
      expect(critical?.severity).toBe('critical')
    })
  })

  describe('getAlertSeverity', () => {
    it('should return info when value is at or below threshold', () => {
      expect(getAlertSeverity('error_rate', 3, 5)).toBe('info')
    })

    it('should return warning when value moderately exceeds threshold', () => {
      expect(getAlertSeverity('error_rate', 6, 5)).toBe('warning')
    })

    it('should return critical when value is 1.5x or more of threshold', () => {
      expect(getAlertSeverity('error_rate', 7.5, 5)).toBe('critical')
      expect(getAlertSeverity('error_rate', 10, 5)).toBe('critical')
    })

    it('should use DEFAULT_ALERT_RULES threshold when not explicitly provided', () => {
      // error_rate default threshold is 5
      expect(getAlertSeverity('error_rate', 10)).toBe('critical')
      expect(getAlertSeverity('error_rate', 6)).toBe('warning')
      expect(getAlertSeverity('error_rate', 3)).toBe('info')
    })

    it('should return info for unknown metrics with no threshold', () => {
      expect(getAlertSeverity('unknown_metric', 50)).toBe('info')
    })

    it('should handle zero threshold gracefully', () => {
      expect(getAlertSeverity('unknown_metric', 0, 0)).toBe('info')
    })
  })

  describe('evaluateAllRules', () => {
    it('should evaluate all rules against provided metrics', () => {
      const metrics = {
        error_rate: 10,
        response_time: 5000,
        lcp: 5000,
        cls: 0.5,
        cpu_usage: 95,
        memory_usage: 90,
      }
      const events = evaluateAllRules(DEFAULT_ALERT_RULES, metrics)
      // All 6 rules should trigger because all values exceed thresholds
      expect(events).toHaveLength(6)
    })

    it('should skip metrics that are not provided', () => {
      const metrics = { error_rate: 10 }
      const events = evaluateAllRules(DEFAULT_ALERT_RULES, metrics)
      expect(events).toHaveLength(1)
      expect(events[0].metric).toBe('error_rate')
    })

    it('should return empty array when no thresholds are breached', () => {
      const metrics = {
        error_rate: 1,
        response_time: 500,
        lcp: 1000,
        cls: 0.05,
        cpu_usage: 30,
        memory_usage: 40,
      }
      const events = evaluateAllRules(DEFAULT_ALERT_RULES, metrics)
      expect(events).toHaveLength(0)
    })
  })

  describe('createAlertRule', () => {
    it('should create a rule with a generated id', () => {
      const rule = createAlertRule({
        name: 'Custom Rule',
        metric: 'error_rate',
        condition: 'gt',
        threshold: 10,
        channel: 'email',
        enabled: true,
      })
      expect(rule.id).toBeDefined()
      expect(rule.id).toMatch(/^rule-/)
      expect(rule.name).toBe('Custom Rule')
    })
  })

  describe('updateAlertRule', () => {
    it('should return a new rule with updated fields (immutable)', () => {
      const original: AlertRule = {
        id: 'test',
        name: 'Original',
        metric: 'cpu_usage',
        condition: 'gt',
        threshold: 80,
        channel: 'email',
        enabled: true,
      }
      const updated = updateAlertRule(original, { threshold: 95, name: 'Updated' })
      expect(updated.threshold).toBe(95)
      expect(updated.name).toBe('Updated')
      expect(updated.id).toBe('test')
      // Verify immutability
      expect(original.threshold).toBe(80)
      expect(original.name).toBe('Original')
    })
  })

  describe('toggleAlertRule', () => {
    it('should toggle enabled to disabled', () => {
      const rule: AlertRule = {
        id: 'test',
        name: 'Test',
        metric: 'error_rate',
        condition: 'gt',
        threshold: 5,
        channel: 'slack',
        enabled: true,
      }
      const toggled = toggleAlertRule(rule)
      expect(toggled.enabled).toBe(false)
      // Verify immutability
      expect(rule.enabled).toBe(true)
    })

    it('should toggle disabled to enabled', () => {
      const rule: AlertRule = {
        id: 'test',
        name: 'Test',
        metric: 'error_rate',
        condition: 'gt',
        threshold: 5,
        channel: 'slack',
        enabled: false,
      }
      const toggled = toggleAlertRule(rule)
      expect(toggled.enabled).toBe(true)
    })
  })
})
