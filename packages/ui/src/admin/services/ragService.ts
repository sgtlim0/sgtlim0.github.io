/**
 * RAG Service — Document search with mock vector DB
 */

import type {
  DocumentChunk,
  RAGSearchResult,
  RAGDocument,
  RAGConfig,
  EmbeddingModel,
} from './ragTypes'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_DOCUMENTS: RAGDocument[] = [
  {
    id: 'doc-1',
    title: 'H Chat 사용자 가이드 v3.0',
    type: 'pdf',
    size: 2450000,
    chunkCount: 156,
    status: 'indexed',
    uploadedAt: '2026-02-01',
    lastIndexed: '2026-03-01',
    tags: ['가이드', '사용자'],
  },
  {
    id: 'doc-2',
    title: 'AI 모델 관리 매뉴얼',
    type: 'docx',
    size: 890000,
    chunkCount: 67,
    status: 'indexed',
    uploadedAt: '2026-01-15',
    lastIndexed: '2026-03-01',
    tags: ['AI', '모델', '관리'],
  },
  {
    id: 'doc-3',
    title: 'API 레퍼런스 문서',
    type: 'md',
    size: 345000,
    chunkCount: 45,
    status: 'indexed',
    uploadedAt: '2026-02-20',
    lastIndexed: '2026-03-05',
    tags: ['API', '개발'],
  },
  {
    id: 'doc-4',
    title: '보안 정책 가이드라인',
    type: 'pdf',
    size: 1200000,
    chunkCount: 89,
    status: 'indexed',
    uploadedAt: '2025-12-10',
    lastIndexed: '2026-02-28',
    tags: ['보안', '정책'],
  },
  {
    id: 'doc-5',
    title: '데이터 처리 표준안',
    type: 'docx',
    size: 670000,
    chunkCount: 52,
    status: 'indexed',
    uploadedAt: '2026-01-20',
    lastIndexed: '2026-03-03',
    tags: ['데이터', '표준'],
  },
  {
    id: 'doc-6',
    title: '온보딩 교육 자료',
    type: 'pdf',
    size: 3100000,
    chunkCount: 198,
    status: 'processing',
    uploadedAt: '2026-03-06',
    lastIndexed: '2026-03-06',
    tags: ['교육', '온보딩'],
  },
]

const MOCK_CHUNKS: Record<string, DocumentChunk[]> = {
  'AI 모델': [
    {
      id: 'c1',
      documentId: 'doc-2',
      documentTitle: 'AI 모델 관리 매뉴얼',
      content:
        'H Chat은 86개 AI 모델을 지원합니다. OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini Pro 등 주요 프로바이더의 최신 모델을 통합 관리할 수 있습니다.',
      section: '1. 개요',
      relevanceScore: 0.95,
      highlightRanges: [{ start: 0, end: 15 }],
    },
    {
      id: 'c2',
      documentId: 'doc-2',
      documentTitle: 'AI 모델 관리 매뉴얼',
      content:
        '모델 라우팅은 비용, 성능, 레이턴시를 기반으로 최적의 모델을 자동 선택합니다. 관리자는 모델별 우선순위와 폴백 정책을 설정할 수 있습니다.',
      section: '3. 모델 라우팅',
      relevanceScore: 0.88,
      highlightRanges: [{ start: 0, end: 8 }],
    },
    {
      id: 'c3',
      documentId: 'doc-1',
      documentTitle: 'H Chat 사용자 가이드 v3.0',
      content:
        'AI 모델 선택 시 비용과 성능의 균형을 고려하세요. 일반 채팅에는 GPT-4o-mini, 복잡한 분석에는 Claude 3.5 Sonnet을 권장합니다.',
      section: '5. 모델 선택 가이드',
      relevanceScore: 0.82,
      highlightRanges: [{ start: 0, end: 8 }],
    },
  ],
  API: [
    {
      id: 'c4',
      documentId: 'doc-3',
      documentTitle: 'API 레퍼런스 문서',
      content:
        'REST API는 Bearer 토큰 인증을 사용합니다. 모든 요청에 Authorization 헤더를 포함해야 합니다. 토큰은 /api/auth/login 엔드포인트에서 발급받을 수 있습니다.',
      section: '인증',
      relevanceScore: 0.93,
      highlightRanges: [{ start: 0, end: 8 }],
    },
    {
      id: 'c5',
      documentId: 'doc-3',
      documentTitle: 'API 레퍼런스 문서',
      content:
        'Rate limiting: 기본 플랜 100 req/min, Pro 플랜 500 req/min, Enterprise 플랜 무제한. 429 응답 시 Retry-After 헤더를 확인하세요.',
      section: 'Rate Limiting',
      relevanceScore: 0.85,
      highlightRanges: [{ start: 0, end: 13 }],
    },
  ],
  보안: [
    {
      id: 'c6',
      documentId: 'doc-4',
      documentTitle: '보안 정책 가이드라인',
      content:
        '모든 데이터는 AES-256으로 암호화하여 저장합니다. 전송 시 TLS 1.3을 사용하며, API 키는 Vault에 안전하게 보관됩니다.',
      section: '2. 데이터 암호화',
      relevanceScore: 0.91,
      highlightRanges: [{ start: 0, end: 5 }],
    },
    {
      id: 'c7',
      documentId: 'doc-4',
      documentTitle: '보안 정책 가이드라인',
      content:
        'SSO 연동은 SAML 2.0과 OAuth 2.0을 지원합니다. Okta, Azure AD, Google Workspace와의 통합이 가능합니다.',
      section: '4. SSO',
      relevanceScore: 0.78,
      highlightRanges: [{ start: 0, end: 7 }],
    },
  ],
}

const EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    id: 'text-embedding-3-large',
    name: 'OpenAI text-embedding-3-large',
    provider: 'OpenAI',
    dimensions: 3072,
    maxTokens: 8191,
    pricePerMToken: 0.13,
  },
  {
    id: 'text-embedding-3-small',
    name: 'OpenAI text-embedding-3-small',
    provider: 'OpenAI',
    dimensions: 1536,
    maxTokens: 8191,
    pricePerMToken: 0.02,
  },
  {
    id: 'embed-v4',
    name: 'Cohere Embed v4',
    provider: 'Cohere',
    dimensions: 1024,
    maxTokens: 512,
    pricePerMToken: 0.1,
  },
]

export async function searchDocuments(query: string, topK: number = 5): Promise<RAGSearchResult> {
  await delay(400)
  const startTime = Date.now()

  let matchedChunks: DocumentChunk[] = []
  const queryLower = query.toLowerCase()

  for (const [keyword, chunks] of Object.entries(MOCK_CHUNKS)) {
    if (queryLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(queryLower)) {
      matchedChunks = [...matchedChunks, ...chunks]
    }
  }

  if (matchedChunks.length === 0) {
    const allChunks = Object.values(MOCK_CHUNKS).flat()
    matchedChunks = allChunks.filter(
      (c) =>
        c.content.toLowerCase().includes(queryLower) ||
        c.documentTitle.toLowerCase().includes(queryLower),
    )
  }

  matchedChunks.sort((a, b) => b.relevanceScore - a.relevanceScore)
  const results = matchedChunks.slice(0, topK)

  return {
    query,
    chunks: results,
    totalResults: results.length,
    searchTimeMs: Date.now() - startTime,
    model: 'text-embedding-3-small',
  }
}

export async function getDocuments(): Promise<RAGDocument[]> {
  await delay(200)
  return MOCK_DOCUMENTS
}

export async function getDocumentById(id: string): Promise<RAGDocument | null> {
  await delay(100)
  return MOCK_DOCUMENTS.find((d) => d.id === id) ?? null
}

export async function uploadDocument(file: {
  name: string
  size: number
  type: string
}): Promise<RAGDocument> {
  await delay(500)
  const ext = file.name.split('.').pop() || 'txt'
  return {
    id: `doc-${Date.now()}`,
    title: file.name,
    type: ext as RAGDocument['type'],
    size: file.size,
    chunkCount: 0,
    status: 'processing',
    uploadedAt: new Date().toISOString(),
    lastIndexed: new Date().toISOString(),
    tags: [],
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  await delay(200)
  return MOCK_DOCUMENTS.some((d) => d.id === id)
}

export function getRAGConfig(): RAGConfig {
  return {
    embeddingModel: 'text-embedding-3-small',
    chunkSize: 512,
    chunkOverlap: 50,
    topK: 5,
    minRelevanceScore: 0.7,
    hybridSearch: true,
  }
}

export async function getEmbeddingModels(): Promise<EmbeddingModel[]> {
  await delay(100)
  return EMBEDDING_MODELS
}
