/**
 * AI Workflow Builder Service
 *
 * Mock workflow service with localStorage persistence.
 * Provides CRUD operations for workflows, nodes, edges, and execution.
 * All mutations return new objects (immutable pattern).
 */

import type {
  NodeCatalogItem,
  NodeType,
  Workflow,
  WorkflowEdge,
  WorkflowExecution,
  WorkflowNode,
  WorkflowTemplate,
} from './workflowTypes'

// ============= Constants =============

const STORAGE_KEY = 'hchat-workflows'

let idCounter = 0
function generateId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

// ============= Node Catalog =============

export const NODE_CATALOG: readonly NodeCatalogItem[] = [
  {
    type: 'input',
    name: '입력',
    description: '사용자 입력 또는 트리거',
    icon: 'IN',
    category: 'input-output',
    configSchema: [
      {
        key: 'source',
        label: '입력 소스',
        type: 'select',
        options: ['user', 'api', 'schedule', 'webhook'],
      },
    ],
  },
  {
    type: 'llm',
    name: 'LLM 호출',
    description: 'AI 모델 호출',
    icon: 'AI',
    category: 'processing',
    configSchema: [
      {
        key: 'model',
        label: '모델',
        type: 'select',
        options: ['GPT-4o', 'Claude 3.5', 'Gemini Pro', 'Mistral Large'],
      },
      { key: 'temperature', label: '온도', type: 'number' },
      { key: 'maxTokens', label: '최대 토큰', type: 'number' },
    ],
  },
  {
    type: 'transform',
    name: '데이터 변환',
    description: '데이터 형식 변환 및 가공',
    icon: 'TF',
    category: 'processing',
    configSchema: [
      {
        key: 'format',
        label: '변환 형식',
        type: 'select',
        options: ['json', 'text', 'csv', 'xml'],
      },
    ],
  },
  {
    type: 'condition',
    name: '조건 분기',
    description: '조건에 따른 분기 처리',
    icon: 'IF',
    category: 'control',
    configSchema: [{ key: 'expression', label: '조건식', type: 'text' }],
  },
  {
    type: 'output',
    name: '출력',
    description: '결과 출력 및 저장',
    icon: 'OUT',
    category: 'input-output',
    configSchema: [
      {
        key: 'destination',
        label: '출력 대상',
        type: 'select',
        options: ['response', 'file', 'database', 'webhook'],
      },
    ],
  },
  {
    type: 'api',
    name: 'API 호출',
    description: '외부 API 엔드포인트 호출',
    icon: 'API',
    category: 'processing',
    configSchema: [
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'method', label: '메서드', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
    ],
  },
  {
    type: 'template',
    name: '프롬프트 템플릿',
    description: '프롬프트 템플릿 적용',
    icon: 'PT',
    category: 'processing',
    configSchema: [{ key: 'template', label: '템플릿', type: 'text' }],
  },
  {
    type: 'merge',
    name: '병합',
    description: '여러 결과 병합',
    icon: 'MG',
    category: 'control',
    configSchema: [
      {
        key: 'strategy',
        label: '병합 전략',
        type: 'select',
        options: ['concat', 'first', 'best', 'vote'],
      },
    ],
  },
]

// ============= Workflow Templates =============

export const WORKFLOW_TEMPLATES: readonly WorkflowTemplate[] = [
  {
    id: 'tpl-rag',
    name: 'RAG 파이프라인',
    description: '문서 검색 및 AI 응답 생성 파이프라인',
    category: 'rag',
    icon: 'RAG',
    nodes: [
      {
        id: 'tpl-rag-1',
        type: 'input',
        label: '사용자 질문',
        description: '질문 입력',
        position: { x: 50, y: 200 },
        config: { source: 'user' },
        status: 'idle',
      },
      {
        id: 'tpl-rag-2',
        type: 'api',
        label: '벡터 검색',
        description: 'Embedding 검색',
        position: { x: 250, y: 200 },
        config: { url: '/api/search', method: 'POST' },
        status: 'idle',
      },
      {
        id: 'tpl-rag-3',
        type: 'template',
        label: '프롬프트 구성',
        description: '컨텍스트 + 질문 결합',
        position: { x: 450, y: 200 },
        config: { template: '{{context}}\n\n질문: {{query}}' },
        status: 'idle',
      },
      {
        id: 'tpl-rag-4',
        type: 'llm',
        label: 'LLM 응답',
        description: 'AI 답변 생성',
        position: { x: 650, y: 200 },
        config: { model: 'GPT-4o', temperature: 0.3, maxTokens: 2048 },
        status: 'idle',
      },
      {
        id: 'tpl-rag-5',
        type: 'output',
        label: '응답 출력',
        description: '사용자에게 전달',
        position: { x: 850, y: 200 },
        config: { destination: 'response' },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'tpl-rag-e1', sourceId: 'tpl-rag-1', targetId: 'tpl-rag-2' },
      { id: 'tpl-rag-e2', sourceId: 'tpl-rag-2', targetId: 'tpl-rag-3' },
      { id: 'tpl-rag-e3', sourceId: 'tpl-rag-3', targetId: 'tpl-rag-4' },
      { id: 'tpl-rag-e4', sourceId: 'tpl-rag-4', targetId: 'tpl-rag-5' },
    ],
  },
  {
    id: 'tpl-agent',
    name: '에이전트 체인',
    description: '다단계 AI 에이전트 처리 체인',
    category: 'agent',
    icon: 'AGT',
    nodes: [
      {
        id: 'tpl-agent-1',
        type: 'input',
        label: '작업 입력',
        description: '작업 요청',
        position: { x: 50, y: 200 },
        config: { source: 'api' },
        status: 'idle',
      },
      {
        id: 'tpl-agent-2',
        type: 'llm',
        label: '계획 수립',
        description: '작업 분해',
        position: { x: 250, y: 200 },
        config: { model: 'Claude 3.5', temperature: 0.2, maxTokens: 1024 },
        status: 'idle',
      },
      {
        id: 'tpl-agent-3',
        type: 'condition',
        label: '분기 판단',
        description: '작업 유형별 분기',
        position: { x: 450, y: 200 },
        config: { expression: 'plan.type === "search"' },
        status: 'idle',
      },
      {
        id: 'tpl-agent-4',
        type: 'llm',
        label: '실행 에이전트',
        description: '작업 실행',
        position: { x: 650, y: 200 },
        config: { model: 'GPT-4o', temperature: 0.5, maxTokens: 2048 },
        status: 'idle',
      },
      {
        id: 'tpl-agent-5',
        type: 'output',
        label: '결과 저장',
        description: '결과 저장',
        position: { x: 850, y: 200 },
        config: { destination: 'database' },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'tpl-agent-e1', sourceId: 'tpl-agent-1', targetId: 'tpl-agent-2' },
      { id: 'tpl-agent-e2', sourceId: 'tpl-agent-2', targetId: 'tpl-agent-3' },
      { id: 'tpl-agent-e3', sourceId: 'tpl-agent-3', targetId: 'tpl-agent-4' },
      { id: 'tpl-agent-e4', sourceId: 'tpl-agent-4', targetId: 'tpl-agent-5' },
    ],
  },
  {
    id: 'tpl-summary',
    name: '문서 요약',
    description: '긴 문서를 단계적으로 요약하는 파이프라인',
    category: 'pipeline',
    icon: 'SUM',
    nodes: [
      {
        id: 'tpl-sum-1',
        type: 'input',
        label: '문서 입력',
        description: '문서 업로드',
        position: { x: 50, y: 200 },
        config: { source: 'api' },
        status: 'idle',
      },
      {
        id: 'tpl-sum-2',
        type: 'transform',
        label: '청크 분할',
        description: '문서를 청크로 분할',
        position: { x: 250, y: 200 },
        config: { format: 'text' },
        status: 'idle',
      },
      {
        id: 'tpl-sum-3',
        type: 'llm',
        label: '청크별 요약',
        description: '각 청크 요약',
        position: { x: 450, y: 200 },
        config: { model: 'GPT-4o', temperature: 0.3, maxTokens: 512 },
        status: 'idle',
      },
      {
        id: 'tpl-sum-4',
        type: 'merge',
        label: '요약 병합',
        description: '요약 결과 통합',
        position: { x: 650, y: 200 },
        config: { strategy: 'concat' },
        status: 'idle',
      },
      {
        id: 'tpl-sum-5',
        type: 'output',
        label: '최종 요약',
        description: '결과 출력',
        position: { x: 850, y: 200 },
        config: { destination: 'response' },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'tpl-sum-e1', sourceId: 'tpl-sum-1', targetId: 'tpl-sum-2' },
      { id: 'tpl-sum-e2', sourceId: 'tpl-sum-2', targetId: 'tpl-sum-3' },
      { id: 'tpl-sum-e3', sourceId: 'tpl-sum-3', targetId: 'tpl-sum-4' },
      { id: 'tpl-sum-e4', sourceId: 'tpl-sum-4', targetId: 'tpl-sum-5' },
    ],
  },
  {
    id: 'tpl-classify',
    name: '자동 분류',
    description: '입력 데이터를 자동으로 분류하고 라우팅',
    category: 'automation',
    icon: 'CLS',
    nodes: [
      {
        id: 'tpl-cls-1',
        type: 'input',
        label: '데이터 수신',
        description: '웹훅 트리거',
        position: { x: 50, y: 200 },
        config: { source: 'webhook' },
        status: 'idle',
      },
      {
        id: 'tpl-cls-2',
        type: 'llm',
        label: 'AI 분류',
        description: '카테고리 분류',
        position: { x: 250, y: 200 },
        config: { model: 'Mistral Large', temperature: 0.1, maxTokens: 256 },
        status: 'idle',
      },
      {
        id: 'tpl-cls-3',
        type: 'condition',
        label: '카테고리 분기',
        description: '분류 결과별 분기',
        position: { x: 450, y: 200 },
        config: { expression: 'category === "urgent"' },
        status: 'idle',
      },
      {
        id: 'tpl-cls-4',
        type: 'output',
        label: '결과 저장',
        description: '분류 결과 저장',
        position: { x: 650, y: 200 },
        config: { destination: 'database' },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'tpl-cls-e1', sourceId: 'tpl-cls-1', targetId: 'tpl-cls-2' },
      { id: 'tpl-cls-e2', sourceId: 'tpl-cls-2', targetId: 'tpl-cls-3' },
      { id: 'tpl-cls-e3', sourceId: 'tpl-cls-3', targetId: 'tpl-cls-4' },
    ],
  },
]

// ============= Storage Helpers =============

function loadWorkflows(): Workflow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Workflow[]
  } catch {
    return []
  }
}

function persistWorkflows(workflows: readonly Workflow[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows))
}

function updateWorkflowInList(
  workflows: readonly Workflow[],
  workflowId: string,
  updater: (workflow: Workflow) => Workflow,
): Workflow[] {
  return workflows.map((w) => (w.id === workflowId ? updater(w) : w))
}

function createNodeFromType(nodeType: NodeType, position: { x: number; y: number }): WorkflowNode {
  const catalogItem = NODE_CATALOG.find((c) => c.type === nodeType)
  const defaultConfig = catalogItem
    ? catalogItem.configSchema.reduce<Record<string, string | number | boolean>>((acc, field) => {
        if (field.options && field.options.length > 0) {
          return { ...acc, [field.key]: field.options[0] }
        }
        if (field.type === 'number') {
          return { ...acc, [field.key]: 0 }
        }
        return { ...acc, [field.key]: '' }
      }, {})
    : {}

  return {
    id: generateId('node'),
    type: nodeType,
    label: catalogItem?.name ?? nodeType,
    description: catalogItem?.description ?? '',
    position,
    config: defaultConfig,
    status: 'idle',
  }
}

// ============= Node / Template Factories =============

/** Create a new node (for in-memory usage by hooks) */
export function createNode(type: NodeType, position: { x: number; y: number }): WorkflowNode {
  return createNodeFromType(type, position)
}

/** Create a workflow object from a template (not persisted) */
export function createWorkflowFromTemplate(template: WorkflowTemplate): Workflow {
  const now = Date.now()
  return {
    id: generateId('wf'),
    name: template.name,
    description: template.description,
    nodes: template.nodes,
    edges: template.edges,
    createdAt: now,
    updatedAt: now,
    isActive: false,
  }
}

// ============= Public API =============

export function getNodeCatalog(): readonly NodeCatalogItem[] {
  return NODE_CATALOG
}

export function getWorkflowTemplates(): readonly WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES
}

export function getWorkflows(): Workflow[] {
  return loadWorkflows()
}

export function getWorkflow(id: string): Workflow | null {
  return loadWorkflows().find((w) => w.id === id) ?? null
}

export function createWorkflow(name: string, description = ''): Workflow {
  const workflow: Workflow = {
    id: generateId('wf'),
    name,
    description,
    nodes: [],
    edges: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: false,
  }
  const workflows = loadWorkflows()
  persistWorkflows([...workflows, workflow])
  return workflow
}

export function createFromTemplate(templateId: string): Workflow {
  const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId)
  if (!template) {
    throw new Error(`Template not found: ${templateId}`)
  }
  const now = Date.now()
  const newNodes = template.nodes.map((n) => ({ ...n, id: generateId('node') }))

  // Build ID mapping for edge remapping
  const nodeIdMap: Record<string, string> = {}
  template.nodes.forEach((origNode, idx) => {
    nodeIdMap[origNode.id] = newNodes[idx].id
  })

  const mappedEdges: WorkflowEdge[] = template.edges.map((e) => ({
    id: generateId('edge'),
    sourceId: nodeIdMap[e.sourceId] ?? e.sourceId,
    targetId: nodeIdMap[e.targetId] ?? e.targetId,
    label: e.label,
  }))

  const workflow: Workflow = {
    id: generateId('wf'),
    name: template.name,
    description: template.description,
    nodes: newNodes,
    edges: mappedEdges,
    createdAt: now,
    updatedAt: now,
    isActive: false,
  }
  const workflows = loadWorkflows()
  persistWorkflows([...workflows, workflow])
  return workflow
}

export function saveWorkflow(workflow: Workflow): void {
  const workflows = loadWorkflows()
  const updated = { ...workflow, updatedAt: Date.now() }
  const exists = workflows.some((w) => w.id === workflow.id)
  const next = exists
    ? workflows.map((w) => (w.id === workflow.id ? updated : w))
    : [...workflows, updated]
  persistWorkflows(next)
}

export function deleteWorkflow(id: string): void {
  const workflows = loadWorkflows().filter((w) => w.id !== id)
  persistWorkflows(workflows)
}

export function addNode(
  workflowId: string,
  nodeType: NodeType,
  position: { x: number; y: number },
): WorkflowNode {
  const node = createNodeFromType(nodeType, position)
  const workflows = loadWorkflows()
  const updated = updateWorkflowInList(workflows, workflowId, (w) => ({
    ...w,
    nodes: [...w.nodes, node],
    updatedAt: Date.now(),
  }))
  persistWorkflows(updated)
  return node
}

export function removeNode(workflowId: string, nodeId: string): void {
  const workflows = loadWorkflows()
  const updated = updateWorkflowInList(workflows, workflowId, (w) => ({
    ...w,
    nodes: w.nodes.filter((n) => n.id !== nodeId),
    edges: w.edges.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId),
    updatedAt: Date.now(),
  }))
  persistWorkflows(updated)
}

export function updateNodePosition(
  workflowId: string,
  nodeId: string,
  position: { x: number; y: number },
): void {
  const workflows = loadWorkflows()
  const updated = updateWorkflowInList(workflows, workflowId, (w) => ({
    ...w,
    nodes: w.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
    updatedAt: Date.now(),
  }))
  persistWorkflows(updated)
}

export function updateNodeConfig(
  workflowId: string,
  nodeId: string,
  config: Record<string, string | number | boolean>,
): void {
  const workflows = loadWorkflows()
  const updated = updateWorkflowInList(workflows, workflowId, (w) => ({
    ...w,
    nodes: w.nodes.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n)),
    updatedAt: Date.now(),
  }))
  persistWorkflows(updated)
}

export function addEdge(workflowId: string, sourceId: string, targetId: string): WorkflowEdge {
  const edge: WorkflowEdge = {
    id: generateId('edge'),
    sourceId,
    targetId,
  }
  const workflows = loadWorkflows()
  const updated = updateWorkflowInList(workflows, workflowId, (w) => ({
    ...w,
    edges: [...w.edges, edge],
    updatedAt: Date.now(),
  }))
  persistWorkflows(updated)
  return edge
}

export function removeEdge(workflowId: string, edgeId: string): void {
  const workflows = loadWorkflows()
  const updated = updateWorkflowInList(workflows, workflowId, (w) => ({
    ...w,
    edges: w.edges.filter((e) => e.id !== edgeId),
    updatedAt: Date.now(),
  }))
  persistWorkflows(updated)
}

export function executeWorkflow(workflowId: string): WorkflowExecution {
  const workflow = getWorkflow(workflowId)
  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowId}`)
  }

  return {
    id: generateId('exec'),
    workflowId,
    status: 'pending',
    startedAt: Date.now(),
    nodeResults: {},
  }
}
