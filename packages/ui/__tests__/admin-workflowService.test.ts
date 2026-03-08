import { describe, it, expect, beforeEach } from 'vitest'
import {
  getNodeCatalog,
  getWorkflowTemplates,
  getWorkflows,
  getWorkflow,
  createWorkflow,
  createFromTemplate,
  createWorkflowFromTemplate,
  saveWorkflow,
  deleteWorkflow,
  addNode,
  removeNode,
  updateNodePosition,
  updateNodeConfig,
  addEdge,
  removeEdge,
  executeWorkflow,
  createNode,
  NODE_CATALOG,
  WORKFLOW_TEMPLATES,
} from '../src/admin/services/workflowService'

describe('workflowService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getNodeCatalog', () => {
    it('should return node catalog', () => {
      const catalog = getNodeCatalog()
      expect(catalog.length).toBeGreaterThan(0)
      catalog.forEach((item) => {
        expect(item).toHaveProperty('type')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('description')
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('category')
        expect(item).toHaveProperty('configSchema')
      })
    })

    it('should include essential node types', () => {
      const types = getNodeCatalog().map((c) => c.type)
      expect(types).toContain('input')
      expect(types).toContain('output')
      expect(types).toContain('llm')
      expect(types).toContain('condition')
      expect(types).toContain('transform')
    })
  })

  describe('getWorkflowTemplates', () => {
    it('should return workflow templates', () => {
      const templates = getWorkflowTemplates()
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach((t) => {
        expect(t).toHaveProperty('id')
        expect(t).toHaveProperty('name')
        expect(t).toHaveProperty('description')
        expect(t).toHaveProperty('nodes')
        expect(t).toHaveProperty('edges')
        expect(t.nodes.length).toBeGreaterThan(0)
      })
    })
  })

  describe('createWorkflow', () => {
    it('should create an empty workflow', () => {
      const workflow = createWorkflow('테스트 워크플로우', '테스트용')

      expect(workflow.id).toBeTruthy()
      expect(workflow.name).toBe('테스트 워크플로우')
      expect(workflow.description).toBe('테스트용')
      expect(workflow.nodes).toEqual([])
      expect(workflow.edges).toEqual([])
      expect(workflow.isActive).toBe(false)
    })

    it('should persist to localStorage', () => {
      createWorkflow('저장 테스트')
      const workflows = getWorkflows()
      const found = workflows.find((w) => w.name === '저장 테스트')
      expect(found).toBeDefined()
    })
  })

  describe('getWorkflow', () => {
    it('should return workflow by ID', () => {
      const created = createWorkflow('Find Me')
      const found = getWorkflow(created.id)

      expect(found).not.toBeNull()
      expect(found?.name).toBe('Find Me')
    })

    it('should return null for non-existent ID', () => {
      const found = getWorkflow('non-existent')
      expect(found).toBeNull()
    })
  })

  describe('createFromTemplate', () => {
    it('should create workflow from template', () => {
      const workflow = createFromTemplate('tpl-rag')

      expect(workflow.name).toBe('RAG 파이프라인')
      expect(workflow.nodes.length).toBeGreaterThan(0)
      expect(workflow.edges.length).toBeGreaterThan(0)
      expect(workflow.isActive).toBe(false)
    })

    it('should generate new IDs for nodes and edges', () => {
      const template = WORKFLOW_TEMPLATES.find((t) => t.id === 'tpl-rag')!
      const workflow = createFromTemplate('tpl-rag')

      workflow.nodes.forEach((node) => {
        const originalIds = template.nodes.map((n) => n.id)
        expect(originalIds).not.toContain(node.id)
      })
    })

    it('should remap edge references to new node IDs', () => {
      const workflow = createFromTemplate('tpl-rag')
      const nodeIds = workflow.nodes.map((n) => n.id)

      workflow.edges.forEach((edge) => {
        expect(nodeIds).toContain(edge.sourceId)
        expect(nodeIds).toContain(edge.targetId)
      })
    })

    it('should throw for non-existent template', () => {
      expect(() => createFromTemplate('non-existent')).toThrow('Template not found')
    })
  })

  describe('createWorkflowFromTemplate', () => {
    it('should create in-memory workflow from template', () => {
      const template = WORKFLOW_TEMPLATES[0]
      const workflow = createWorkflowFromTemplate(template)

      expect(workflow.name).toBe(template.name)
      expect(workflow.nodes).toEqual(template.nodes)
      expect(workflow.edges).toEqual(template.edges)
    })
  })

  describe('createNode', () => {
    it('should create node with catalog defaults', () => {
      const node = createNode('llm', { x: 100, y: 200 })

      expect(node.id).toBeTruthy()
      expect(node.type).toBe('llm')
      expect(node.label).toBe('LLM 호출')
      expect(node.position).toEqual({ x: 100, y: 200 })
      expect(node.status).toBe('idle')
      expect(node.config).toBeDefined()
    })
  })

  describe('saveWorkflow', () => {
    it('should save existing workflow', () => {
      const workflow = createWorkflow('Save Test')
      const updated = { ...workflow, name: '수정됨' }
      saveWorkflow(updated)

      const found = getWorkflow(workflow.id)
      expect(found?.name).toBe('수정됨')
    })

    it('should add new workflow if not existing', () => {
      const workflow = {
        id: 'manual-wf',
        name: '수동 생성',
        description: '',
        nodes: [],
        edges: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: false,
      }
      saveWorkflow(workflow)

      const found = getWorkflow('manual-wf')
      expect(found).toBeDefined()
    })
  })

  describe('deleteWorkflow', () => {
    it('should delete workflow', () => {
      const workflow = createWorkflow('삭제 대상')
      deleteWorkflow(workflow.id)

      const found = getWorkflow(workflow.id)
      expect(found).toBeNull()
    })
  })

  describe('addNode', () => {
    it('should add node to workflow', () => {
      const workflow = createWorkflow('Node Test')
      const node = addNode(workflow.id, 'input', { x: 50, y: 100 })

      expect(node.type).toBe('input')
      const updated = getWorkflow(workflow.id)
      expect(updated?.nodes.length).toBe(1)
    })
  })

  describe('removeNode', () => {
    it('should remove node and connected edges', () => {
      const workflow = createWorkflow('Remove Node Test')
      const node1 = addNode(workflow.id, 'input', { x: 0, y: 0 })
      const node2 = addNode(workflow.id, 'output', { x: 200, y: 0 })
      addEdge(workflow.id, node1.id, node2.id)

      removeNode(workflow.id, node1.id)
      const updated = getWorkflow(workflow.id)
      expect(updated?.nodes.length).toBe(1)
      expect(updated?.edges.length).toBe(0)
    })
  })

  describe('updateNodePosition', () => {
    it('should update node position', () => {
      const workflow = createWorkflow('Position Test')
      const node = addNode(workflow.id, 'llm', { x: 0, y: 0 })
      updateNodePosition(workflow.id, node.id, { x: 300, y: 400 })

      const updated = getWorkflow(workflow.id)
      const updatedNode = updated?.nodes.find((n) => n.id === node.id)
      expect(updatedNode?.position).toEqual({ x: 300, y: 400 })
    })
  })

  describe('updateNodeConfig', () => {
    it('should update node config', () => {
      const workflow = createWorkflow('Config Test')
      const node = addNode(workflow.id, 'llm', { x: 0, y: 0 })
      updateNodeConfig(workflow.id, node.id, { model: 'Claude 3.5', temperature: 0.7 })

      const updated = getWorkflow(workflow.id)
      const updatedNode = updated?.nodes.find((n) => n.id === node.id)
      expect(updatedNode?.config.model).toBe('Claude 3.5')
      expect(updatedNode?.config.temperature).toBe(0.7)
    })
  })

  describe('addEdge', () => {
    it('should add edge between nodes', () => {
      const workflow = createWorkflow('Edge Test')
      const node1 = addNode(workflow.id, 'input', { x: 0, y: 0 })
      const node2 = addNode(workflow.id, 'output', { x: 200, y: 0 })

      const edge = addEdge(workflow.id, node1.id, node2.id)
      expect(edge.id).toBeTruthy()
      expect(edge.sourceId).toBe(node1.id)
      expect(edge.targetId).toBe(node2.id)
    })
  })

  describe('removeEdge', () => {
    it('should remove an edge', () => {
      const workflow = createWorkflow('Remove Edge Test')
      const node1 = addNode(workflow.id, 'input', { x: 0, y: 0 })
      const node2 = addNode(workflow.id, 'output', { x: 200, y: 0 })
      const edge = addEdge(workflow.id, node1.id, node2.id)

      removeEdge(workflow.id, edge.id)
      const updated = getWorkflow(workflow.id)
      expect(updated?.edges.length).toBe(0)
    })
  })

  describe('executeWorkflow', () => {
    it('should return execution object', () => {
      const workflow = createWorkflow('Execute Test')
      const execution = executeWorkflow(workflow.id)

      expect(execution).toHaveProperty('id')
      expect(execution.workflowId).toBe(workflow.id)
      expect(execution.status).toBe('pending')
      expect(execution.nodeResults).toEqual({})
      expect(execution).toHaveProperty('startedAt')
    })

    it('should throw for non-existent workflow', () => {
      expect(() => executeWorkflow('non-existent')).toThrow('Workflow not found')
    })
  })
})
