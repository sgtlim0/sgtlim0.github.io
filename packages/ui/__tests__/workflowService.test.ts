import { describe, it, expect, beforeEach } from 'vitest'
import {
  getNodeCatalog,
  getWorkflowTemplates,
  createWorkflow,
  getWorkflows,
  getWorkflow,
  createFromTemplate,
  saveWorkflow,
  deleteWorkflow,
  addNode,
  removeNode,
  updateNodePosition,
  updateNodeConfig,
  addEdge,
  removeEdge,
  WORKFLOW_TEMPLATES,
} from '../src/admin/services/workflowService'

describe('workflowService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getNodeCatalog returns 8 items', () => {
    const catalog = getNodeCatalog()
    expect(catalog).toHaveLength(8)
    for (const item of catalog) {
      expect(item).toHaveProperty('type')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('category')
    }
  })

  it('getWorkflowTemplates returns 4 templates', () => {
    const templates = getWorkflowTemplates()
    expect(templates).toHaveLength(4)
    for (const template of templates) {
      expect(template).toHaveProperty('id')
      expect(template).toHaveProperty('name')
      expect(template.nodes.length).toBeGreaterThan(0)
      expect(template.edges.length).toBeGreaterThan(0)
    }
  })

  it('createWorkflow creates a new workflow with empty nodes/edges', () => {
    const wf = createWorkflow('Test Workflow')
    expect(wf.name).toBe('Test Workflow')
    expect(wf.nodes).toHaveLength(0)
    expect(wf.edges).toHaveLength(0)
    expect(wf.isActive).toBe(false)
    // Should be persisted
    const all = getWorkflows()
    expect(all.some((w) => w.id === wf.id)).toBe(true)
  })

  it('createFromTemplate creates workflow with nodes and edges from template', () => {
    const wf = createFromTemplate(WORKFLOW_TEMPLATES[0].id)
    expect(wf.name).toBe(WORKFLOW_TEMPLATES[0].name)
    expect(wf.nodes.length).toBeGreaterThan(0)
    expect(wf.edges.length).toBeGreaterThan(0)
    // Should be persisted
    const all = getWorkflows()
    expect(all.some((w) => w.id === wf.id)).toBe(true)
  })

  it('addNode increases node count in persisted workflow', () => {
    const wf = createWorkflow('Add Node Test')
    const before = getWorkflow(wf.id)
    expect(before?.nodes).toHaveLength(0)
    addNode(wf.id, 'llm', { x: 100, y: 100 })
    const after = getWorkflow(wf.id)
    expect(after?.nodes).toHaveLength(1)
    expect(after?.nodes[0].type).toBe('llm')
  })

  it('removeNode removes node and connected edges', () => {
    const wf = createWorkflow('Remove Node Test')
    addNode(wf.id, 'input', { x: 0, y: 0 })
    const after1 = getWorkflow(wf.id)!
    const nodeId = after1.nodes[0].id
    addNode(wf.id, 'llm', { x: 0, y: 150 })
    const after2 = getWorkflow(wf.id)!
    const secondNodeId = after2.nodes[1].id
    addEdge(wf.id, nodeId, secondNodeId)
    expect(getWorkflow(wf.id)!.edges).toHaveLength(1)
    removeNode(wf.id, nodeId)
    const final = getWorkflow(wf.id)!
    expect(final.nodes.every((n) => n.id !== nodeId)).toBe(true)
    expect(final.edges).toHaveLength(0)
  })

  it('addEdge creates an edge between nodes', () => {
    const wf = createWorkflow('Edge Test')
    addNode(wf.id, 'input', { x: 0, y: 0 })
    addNode(wf.id, 'output', { x: 0, y: 150 })
    const updated = getWorkflow(wf.id)!
    const [n1, n2] = updated.nodes
    addEdge(wf.id, n1.id, n2.id)
    const final = getWorkflow(wf.id)!
    expect(final.edges).toHaveLength(1)
    expect(final.edges[0].sourceId).toBe(n1.id)
    expect(final.edges[0].targetId).toBe(n2.id)
  })

  it('removeEdge removes specific edge', () => {
    const wf = createWorkflow('Remove Edge Test')
    addNode(wf.id, 'input', { x: 0, y: 0 })
    addNode(wf.id, 'output', { x: 0, y: 150 })
    const updated = getWorkflow(wf.id)!
    const [n1, n2] = updated.nodes
    addEdge(wf.id, n1.id, n2.id)
    const withEdge = getWorkflow(wf.id)!
    expect(withEdge.edges).toHaveLength(1)
    removeEdge(wf.id, withEdge.edges[0].id)
    expect(getWorkflow(wf.id)!.edges).toHaveLength(0)
  })

  it('updateNodePosition changes position', () => {
    const wf = createWorkflow('Position Test')
    addNode(wf.id, 'llm', { x: 0, y: 0 })
    const nodeId = getWorkflow(wf.id)!.nodes[0].id
    updateNodePosition(wf.id, nodeId, { x: 200, y: 300 })
    const updated = getWorkflow(wf.id)!
    const node = updated.nodes.find((n) => n.id === nodeId)
    expect(node?.position).toEqual({ x: 200, y: 300 })
  })

  it('updateNodeConfig merges config', () => {
    const wf = createWorkflow('Config Test')
    addNode(wf.id, 'llm', { x: 0, y: 0 })
    const nodeId = getWorkflow(wf.id)!.nodes[0].id
    updateNodeConfig(wf.id, nodeId, { model: 'Claude', temperature: 0.5 })
    const updated = getWorkflow(wf.id)!
    const node = updated.nodes.find((n) => n.id === nodeId)
    expect(node?.config.model).toBe('Claude')
    expect(node?.config.temperature).toBe(0.5)
  })

  it('deleteWorkflow removes workflow from storage', () => {
    const wf = createWorkflow('Delete Test')
    expect(getWorkflows().some((w) => w.id === wf.id)).toBe(true)
    deleteWorkflow(wf.id)
    expect(getWorkflows().some((w) => w.id === wf.id)).toBe(false)
  })

  it('saveWorkflow persists to localStorage', () => {
    const wf = createWorkflow('Save Test')
    const modified = { ...wf, name: 'Updated Name' }
    saveWorkflow(modified)
    const saved = getWorkflow(wf.id)
    expect(saved?.name).toBe('Updated Name')
  })
})
