import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  evaluateAlert,
  evaluateAllRules,
  getAlertSeverity,
  createAlertRule,
  updateAlertRule,
  toggleAlertRule,
  DEFAULT_ALERT_RULES,
  AlertManager,
} from '../src/utils/alertConfig'
import type {
  AlertRule,
  MetricData,
  NotificationChannel,
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

  // -----------------------------------------------------------------------
  // AlertManager
  // -----------------------------------------------------------------------

  describe('AlertManager', () => {
    let manager: AlertManager

    const testRules: AlertRule[] = [
      {
        id: 'err',
        name: 'Error Rate',
        metric: 'error_rate',
        condition: 'gt',
        threshold: 5,
        channel: 'slack',
        enabled: true,
      },
      {
        id: 'lcp',
        name: 'LCP',
        metric: 'lcp',
        condition: 'gt',
        threshold: 4000,
        channel: 'email',
        enabled: true,
      },
    ]

    beforeEach(() => {
      manager = new AlertManager({
        rules: testRules,
        defaultCooldownMs: 1000,
        maxHistorySize: 5,
      })
    })

    describe('getRules', () => {
      it('returns a copy of rules', () => {
        const rules = manager.getRules()
        expect(rules).toHaveLength(2)
        expect(rules[0].id).toBe('err')
      })
    })

    describe('addRule', () => {
      it('adds a rule with generated id', () => {
        const rule = manager.addRule({
          name: 'CPU',
          metric: 'cpu_usage',
          condition: 'gt',
          threshold: 90,
          channel: 'email',
          enabled: true,
        })
        expect(rule.id).toMatch(/^rule-/)
        expect(manager.getRules()).toHaveLength(3)
      })
    })

    describe('removeRule', () => {
      it('removes existing rule', () => {
        expect(manager.removeRule('err')).toBe(true)
        expect(manager.getRules()).toHaveLength(1)
      })

      it('returns false for nonexistent rule', () => {
        expect(manager.removeRule('nope')).toBe(false)
      })
    })

    describe('updateRule', () => {
      it('updates existing rule', () => {
        const updated = manager.updateRule('err', { threshold: 10 })
        expect(updated).not.toBeNull()
        expect(updated!.threshold).toBe(10)
      })

      it('returns null for nonexistent rule', () => {
        expect(manager.updateRule('nope', { threshold: 1 })).toBeNull()
      })
    })

    describe('toggleRule', () => {
      it('toggles existing rule', () => {
        const toggled = manager.toggleRule('err')
        expect(toggled).not.toBeNull()
        expect(toggled!.enabled).toBe(false)
      })

      it('returns null for nonexistent rule', () => {
        expect(manager.toggleRule('nope')).toBeNull()
      })
    })

    describe('checkAlerts', () => {
      it('triggers alerts for breached metrics', () => {
        const events = manager.checkAlerts({ errorRate: 10, lcp: 2000 })
        expect(events).toHaveLength(1)
        expect(events[0].ruleId).toBe('err')
      })

      it('triggers multiple alerts', () => {
        const events = manager.checkAlerts({ errorRate: 10, lcp: 5000 })
        expect(events).toHaveLength(2)
      })

      it('returns empty when no breach', () => {
        expect(manager.checkAlerts({ errorRate: 1, lcp: 1000 })).toEqual([])
      })

      it('respects cooldown', () => {
        const now = 100_000
        expect(manager.checkAlerts({ errorRate: 10 }, now)).toHaveLength(1)
        expect(manager.checkAlerts({ errorRate: 10 }, now + 500)).toHaveLength(0)
        expect(manager.checkAlerts({ errorRate: 10 }, now + 1001)).toHaveLength(1)
      })

      it('records events in history', () => {
        manager.checkAlerts({ errorRate: 10 })
        expect(manager.getAlertHistory()).toHaveLength(1)
        expect(manager.getAlertHistory()[0].ruleId).toBe('err')
      })

      it('respects maxHistorySize', () => {
        for (let i = 0; i < 6; i++) {
          manager.checkAlerts({ errorRate: 10 }, i * 2000)
        }
        expect(manager.getAlertHistory()).toHaveLength(5)
      })

      it('fires notification channel on alert', async () => {
        const sendFn = vi.fn().mockResolvedValue(undefined)
        const channel: NotificationChannel = { name: 'slack', send: sendFn }
        const mgr = new AlertManager({
          rules: [testRules[0]],
          channels: { slack: channel },
        })

        mgr.checkAlerts({ errorRate: 10 })
        await vi.waitFor(() => {
          expect(sendFn).toHaveBeenCalledTimes(1)
        })
        expect(sendFn.mock.calls[0][0].ruleId).toBe('err')
      })

      it('does not throw when notification channel fails', () => {
        const failChannel: NotificationChannel = {
          name: 'fail',
          send: vi.fn().mockRejectedValue(new Error('network')),
        }
        const mgr = new AlertManager({
          rules: [testRules[0]],
          channels: { slack: failChannel },
        })
        expect(() => mgr.checkAlerts({ errorRate: 10 })).not.toThrow()
      })

      it('maps camelCase MetricData keys to snake_case', () => {
        const mgr = new AlertManager({
          rules: [...DEFAULT_ALERT_RULES],
          defaultCooldownMs: 0,
        })
        const events = mgr.checkAlerts({
          errorRate: 10,
          responseTime: 5000,
          cpuUsage: 95,
          memoryUsage: 90,
        })
        const metrics = events.map((e) => e.metric)
        expect(metrics).toContain('error_rate')
        expect(metrics).toContain('response_time')
        expect(metrics).toContain('cpu_usage')
        expect(metrics).toContain('memory_usage')
      })
    })

    describe('clearAlert', () => {
      it('removes history entries for a specific rule and resets cooldown', () => {
        manager.checkAlerts({ errorRate: 10 })
        expect(manager.clearAlert('err')).toBe(true)
        expect(manager.getAlertHistory()).toHaveLength(0)
        // Can fire immediately after clearing
        expect(manager.checkAlerts({ errorRate: 10 })).toHaveLength(1)
      })

      it('returns false when no entries match', () => {
        expect(manager.clearAlert('nonexistent')).toBe(false)
      })
    })

    describe('clearAllHistory', () => {
      it('removes all history and cooldowns', () => {
        manager.checkAlerts({ errorRate: 10, lcp: 5000 })
        expect(manager.getAlertHistory()).toHaveLength(2)
        manager.clearAllHistory()
        expect(manager.getAlertHistory()).toHaveLength(0)
        expect(manager.checkAlerts({ errorRate: 10, lcp: 5000 })).toHaveLength(2)
      })
    })

    describe('registerChannel', () => {
      it('registers a channel used on subsequent alerts', async () => {
        const sendFn = vi.fn().mockResolvedValue(undefined)
        manager.registerChannel('slack', { name: 'slack', send: sendFn })
        manager.checkAlerts({ errorRate: 10 })
        await vi.waitFor(() => {
          expect(sendFn).toHaveBeenCalledTimes(1)
        })
      })
    })

    describe('default config', () => {
      it('uses DEFAULT_ALERT_RULES when no rules provided', () => {
        const mgr = new AlertManager()
        expect(mgr.getRules()).toHaveLength(DEFAULT_ALERT_RULES.length)
      })
    })
  })
})
