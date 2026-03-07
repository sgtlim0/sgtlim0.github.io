/**
 * Knowledge Graph Service
 */
import type {
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  EntityExtraction,
  GraphSearchResult,
} from './knowledgeGraphTypes'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_GRAPH: KnowledgeGraph = {
  nodes: [
    { id: 'n1', label: 'H Chat', type: 'project', description: '현대차그룹 생성형 AI 서비스' },
    { id: 'n2', label: 'GPT-4o', type: 'concept', description: 'OpenAI 멀티모달 모델' },
    { id: 'n3', label: 'Claude 3.5', type: 'concept', description: 'Anthropic 추론 모델' },
    { id: 'n4', label: 'RAG', type: 'concept', description: '검색 증강 생성' },
    { id: 'n5', label: '번역 시스템', type: 'project', description: '다국어 번역 파이프라인' },
    { id: 'n6', label: '홍길동', type: 'person', description: 'AI 팀 리드' },
    { id: 'n7', label: 'API 가이드', type: 'document', description: 'REST API 문서' },
    { id: 'n8', label: '보안 정책', type: 'document', description: '보안 가이드라인' },
    { id: 'n9', label: 'SAML', type: 'concept', description: 'SSO 인증 프로토콜' },
    { id: 'n10', label: '벤치마크', type: 'tag' },
    { id: 'n11', label: '파인튜닝', type: 'tag' },
    { id: 'n12', label: '현대자동차', type: 'project', description: '주요 테넌트' },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', label: '사용', weight: 0.9 },
    { id: 'e2', source: 'n1', target: 'n3', label: '사용', weight: 0.85 },
    { id: 'e3', source: 'n1', target: 'n4', label: '적용', weight: 0.8 },
    { id: 'e4', source: 'n5', target: 'n2', label: '기반', weight: 0.7 },
    { id: 'e5', source: 'n6', target: 'n1', label: '관리', weight: 0.95 },
    { id: 'e6', source: 'n6', target: 'n5', label: '개발', weight: 0.9 },
    { id: 'e7', source: 'n7', target: 'n1', label: '문서화', weight: 0.8 },
    { id: 'e8', source: 'n8', target: 'n9', label: '포함', weight: 0.75 },
    { id: 'e9', source: 'n1', target: 'n12', label: '서비스', weight: 0.95 },
    { id: 'e10', source: 'n2', target: 'n10', label: '태그', weight: 0.6 },
    { id: 'e11', source: 'n2', target: 'n11', label: '태그', weight: 0.65 },
  ],
}

export async function getKnowledgeGraph(): Promise<KnowledgeGraph> {
  await delay(300)
  return MOCK_GRAPH
}

export async function getGraphNode(id: string): Promise<GraphNode | null> {
  await delay(100)
  return MOCK_GRAPH.nodes.find((n) => n.id === id) ?? null
}

export async function getNodeEdges(nodeId: string): Promise<GraphEdge[]> {
  await delay(150)
  return MOCK_GRAPH.edges.filter((e) => e.source === nodeId || e.target === nodeId)
}

export async function addGraphNode(node: Omit<GraphNode, 'id'>): Promise<GraphNode> {
  await delay(200)
  return { ...node, id: `n-${Date.now()}` }
}

export async function addGraphEdge(edge: Omit<GraphEdge, 'id'>): Promise<GraphEdge> {
  await delay(200)
  return { ...edge, id: `e-${Date.now()}` }
}

export async function deleteGraphNode(id: string): Promise<boolean> {
  await delay(200)
  return MOCK_GRAPH.nodes.some((n) => n.id === id)
}

export async function extractEntities(text: string): Promise<EntityExtraction> {
  await delay(400)
  const entities = []
  const keywords = [
    { name: 'H Chat', type: 'project' as const },
    { name: 'GPT-4o', type: 'concept' as const },
    { name: 'Claude', type: 'concept' as const },
    { name: 'RAG', type: 'concept' as const },
    { name: 'SAML', type: 'concept' as const },
  ]

  for (const kw of keywords) {
    const idx = text.toLowerCase().indexOf(kw.name.toLowerCase())
    if (idx !== -1) {
      entities.push({
        name: kw.name,
        type: kw.type,
        confidence: 0.85 + Math.random() * 0.15,
        startIndex: idx,
        endIndex: idx + kw.name.length,
      })
    }
  }

  return { text, entities }
}

export async function searchGraph(query: string): Promise<GraphSearchResult> {
  await delay(250)
  const q = query.toLowerCase()
  const matchedNodes = MOCK_GRAPH.nodes.filter(
    (n) => n.label.toLowerCase().includes(q) || (n.description?.toLowerCase().includes(q) ?? false),
  )

  return {
    query,
    nodes: matchedNodes,
    relatedDocuments: [
      { id: 'doc-1', title: 'H Chat 사용자 가이드', relevance: 0.9 },
      { id: 'doc-3', title: 'API 레퍼런스', relevance: 0.75 },
    ],
  }
}
