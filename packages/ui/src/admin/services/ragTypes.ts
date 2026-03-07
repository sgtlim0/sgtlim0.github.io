/**
 * RAG (Retrieval-Augmented Generation) types
 */

export interface DocumentChunk {
  readonly id: string
  readonly documentId: string
  readonly documentTitle: string
  readonly content: string
  readonly section: string
  readonly pageNumber?: number
  readonly relevanceScore: number
  readonly highlightRanges: { start: number; end: number }[]
}

export interface RAGSearchResult {
  readonly query: string
  readonly chunks: DocumentChunk[]
  readonly totalResults: number
  readonly searchTimeMs: number
  readonly model: string
}

export interface RAGDocument {
  readonly id: string
  readonly title: string
  readonly type: 'pdf' | 'docx' | 'txt' | 'md' | 'html'
  readonly size: number
  readonly chunkCount: number
  readonly status: 'indexed' | 'processing' | 'failed'
  readonly uploadedAt: string
  readonly lastIndexed: string
  readonly tags: string[]
}

export interface RAGConfig {
  readonly embeddingModel: string
  readonly chunkSize: number
  readonly chunkOverlap: number
  readonly topK: number
  readonly minRelevanceScore: number
  readonly hybridSearch: boolean
}

export interface EmbeddingModel {
  readonly id: string
  readonly name: string
  readonly provider: string
  readonly dimensions: number
  readonly maxTokens: number
  readonly pricePerMToken: number
}
