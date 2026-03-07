import { describe, it, expect } from 'vitest'
import {
  getTreemapData,
  getSankeyData,
  getScatterData,
  getFunnelData,
  getGaugeData,
  exportChart,
} from '../src/admin/services/advancedChartService'

describe('advancedChartService', () => {
  it('should return treemap with children', async () => {
    const data = await getTreemapData()
    expect(data.name).toBe('AI 사용량')
    expect(data.children!.length).toBeGreaterThan(0)
    data.children!.forEach((c) => {
      expect(c.value).toBeGreaterThan(0)
    })
  })

  it('should return sankey with nodes and links', async () => {
    const data = await getSankeyData()
    expect(data.nodes.length).toBeGreaterThan(0)
    expect(data.links.length).toBeGreaterThan(0)
    data.links.forEach((l) => {
      expect(l.value).toBeGreaterThan(0)
    })
  })

  it('should return scatter points with groups', async () => {
    const data = await getScatterData()
    expect(data.length).toBeGreaterThan(0)
    data.forEach((p) => {
      expect(p.x).toBeGreaterThan(0)
      expect(p.y).toBeGreaterThan(0)
      expect(p.group).toBeDefined()
    })
  })

  it('should return funnel with decreasing values', async () => {
    const data = await getFunnelData()
    expect(data.length).toBeGreaterThan(0)
    expect(data[0].percentage).toBe(100)
    for (let i = 1; i < data.length; i++) {
      expect(data[i].value).toBeLessThanOrEqual(data[i - 1].value)
    }
  })

  it('should return gauge configs with thresholds', async () => {
    const data = await getGaugeData()
    expect(data.length).toBe(3)
    data.forEach((g) => {
      expect(g.value).toBeGreaterThanOrEqual(g.min)
      expect(g.value).toBeLessThanOrEqual(g.max)
      expect(g.thresholds.length).toBeGreaterThan(0)
    })
  })

  it('should export chart', () => {
    const result = exportChart('chart-1', 'png')
    expect(result.fileName).toContain('.png')
  })
})
