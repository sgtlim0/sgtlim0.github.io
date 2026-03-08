import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getTreemapData,
  getSankeyData,
  getScatterData,
  getFunnelData,
  getGaugeData,
  exportChart,
} from '../src/admin/services/advancedChartService'

describe('advancedChartService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getTreemapData', () => {
    it('should return treemap with root and children', async () => {
      const promise = getTreemapData()
      vi.advanceTimersByTime(300)
      const data = await promise

      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('children')
      expect(data.children!.length).toBeGreaterThan(0)
    })

    it('should have nested children with values', async () => {
      const promise = getTreemapData()
      vi.advanceTimersByTime(300)
      const data = await promise

      data.children!.forEach((child) => {
        expect(child).toHaveProperty('name')
        expect(child).toHaveProperty('value')
        if (child.children) {
          child.children.forEach((grandchild) => {
            expect(grandchild).toHaveProperty('name')
            expect(grandchild).toHaveProperty('value')
            expect(grandchild.value).toBeGreaterThan(0)
          })
        }
      })
    })
  })

  describe('getSankeyData', () => {
    it('should return nodes and links', async () => {
      const promise = getSankeyData()
      vi.advanceTimersByTime(300)
      const data = await promise

      expect(data).toHaveProperty('nodes')
      expect(data).toHaveProperty('links')
      expect(data.nodes.length).toBeGreaterThan(0)
      expect(data.links.length).toBeGreaterThan(0)
    })

    it('should have valid link references', async () => {
      const promise = getSankeyData()
      vi.advanceTimersByTime(300)
      const data = await promise

      const nodeIds = data.nodes.map((n) => n.id)
      data.links.forEach((link) => {
        expect(nodeIds).toContain(link.source)
        expect(nodeIds).toContain(link.target)
        expect(link.value).toBeGreaterThan(0)
      })
    })
  })

  describe('getScatterData', () => {
    it('should return scatter data points', async () => {
      const promise = getScatterData()
      vi.advanceTimersByTime(300)
      const data = await promise

      expect(data.length).toBeGreaterThan(0)
      data.forEach((point) => {
        expect(point).toHaveProperty('x')
        expect(point).toHaveProperty('y')
        expect(point).toHaveProperty('label')
        expect(point).toHaveProperty('size')
        expect(point).toHaveProperty('group')
        expect(point).toHaveProperty('color')
        expect(typeof point.x).toBe('number')
        expect(typeof point.y).toBe('number')
      })
    })
  })

  describe('getFunnelData', () => {
    it('should return funnel steps in decreasing order', async () => {
      const promise = getFunnelData()
      vi.advanceTimersByTime(200)
      const data = await promise

      expect(data.length).toBeGreaterThan(0)
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].value).toBeGreaterThanOrEqual(data[i + 1].value)
      }
    })

    it('should have percentage and color', async () => {
      const promise = getFunnelData()
      vi.advanceTimersByTime(200)
      const data = await promise

      data.forEach((step) => {
        expect(step).toHaveProperty('label')
        expect(step).toHaveProperty('value')
        expect(step).toHaveProperty('percentage')
        expect(step).toHaveProperty('color')
        expect(step.percentage).toBeGreaterThanOrEqual(0)
        expect(step.percentage).toBeLessThanOrEqual(100)
      })
    })

    it('should start at 100% percentage', async () => {
      const promise = getFunnelData()
      vi.advanceTimersByTime(200)
      const data = await promise

      expect(data[0].percentage).toBe(100)
    })
  })

  describe('getGaugeData', () => {
    it('should return gauge configs', async () => {
      const promise = getGaugeData()
      vi.advanceTimersByTime(200)
      const data = await promise

      expect(data.length).toBeGreaterThan(0)
      data.forEach((gauge) => {
        expect(gauge).toHaveProperty('value')
        expect(gauge).toHaveProperty('min')
        expect(gauge).toHaveProperty('max')
        expect(gauge).toHaveProperty('label')
        expect(gauge).toHaveProperty('thresholds')
        expect(gauge.value).toBeGreaterThanOrEqual(gauge.min)
        expect(gauge.value).toBeLessThanOrEqual(gauge.max)
        expect(gauge.thresholds.length).toBeGreaterThan(0)
      })
    })

    it('should have thresholds with color and label', async () => {
      const promise = getGaugeData()
      vi.advanceTimersByTime(200)
      const data = await promise

      data.forEach((gauge) => {
        gauge.thresholds.forEach((t) => {
          expect(t).toHaveProperty('value')
          expect(t).toHaveProperty('color')
          expect(t).toHaveProperty('label')
          expect(t.color).toMatch(/^#/)
        })
      })
    })
  })

  describe('exportChart', () => {
    it('should return export info for PNG', () => {
      const result = exportChart('chart-1', 'png')

      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('fileName')
      expect(result.fileName).toContain('.png')
      expect(result.fileName).toContain('chart-1')
    })

    it('should return export info for SVG', () => {
      const result = exportChart('chart-2', 'svg')
      expect(result.fileName).toContain('.svg')
    })

    it('should return export info for PDF', () => {
      const result = exportChart('chart-3', 'pdf')
      expect(result.fileName).toContain('.pdf')
    })
  })
})
