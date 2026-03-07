import { describe, it, expect } from 'vitest'
import {
  getKnowledgeGraph,
  getGraphNode,
  getNodeEdges,
  addGraphNode,
  addGraphEdge,
  deleteGraphNode,
  extractEntities,
  searchGraph,
} from '../src/admin/services/knowledgeGraphService'

describe('knowledgeGraphService', () => {
  it('should return graph with nodes and edges', async () => {
    const graph = await getKnowledgeGraph()
    expect(graph.nodes.length).toBeGreaterThan(0)
    expect(graph.edges.length).toBeGreaterThan(0)
  })

  it('should get node by id', async () => {
    const node = await getGraphNode('n1')
    expect(node).not.toBeNull()
    expect(node!.label).toBe('H Chat')
    expect(node!.type).toBe('project')
  })

  it('should return null for invalid node', async () => {
    expect(await getGraphNode('nonexistent')).toBeNull()
  })

  it('should get edges for a node', async () => {
    const edges = await getNodeEdges('n1')
    expect(edges.length).toBeGreaterThan(0)
    edges.forEach((e) => {
      expect(e.source === 'n1' || e.target === 'n1').toBe(true)
    })
  })

  it('should add a node', async () => {
    const node = await addGraphNode({ label: 'New', type: 'concept' })
    expect(node.id).toBeDefined()
    expect(node.label).toBe('New')
  })

  it('should add an edge', async () => {
    const edge = await addGraphEdge({ source: 'n1', target: 'n2', label: 'test', weight: 0.5 })
    expect(edge.id).toBeDefined()
  })

  it('should delete a node', async () => {
    expect(await deleteGraphNode('n1')).toBe(true)
    expect(await deleteGraphNode('nonexistent')).toBe(false)
  })

  it('should extract entities from text', async () => {
    const result = await extractEntities('H Chat에서 GPT-4o와 Claude를 사용합니다')
    expect(result.entities.length).toBeGreaterThan(0)
    expect(result.entities.some((e) => e.name === 'H Chat')).toBe(true)
    result.entities.forEach((e) => {
      expect(e.confidence).toBeGreaterThan(0.5)
    })
  })

  it('should search graph', async () => {
    const result = await searchGraph('H Chat')
    expect(result.nodes.length).toBeGreaterThan(0)
    expect(result.relatedDocuments.length).toBeGreaterThan(0)
  })

  it('should return empty for no match', async () => {
    const result = await searchGraph('xyznonexistent')
    expect(result.nodes.length).toBe(0)
  })
})
