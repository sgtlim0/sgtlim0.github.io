/**
 * Knowledge Graph types
 */

export type NodeType = 'document' | 'concept' | 'person' | 'project' | 'tag'

export interface GraphNode {
  readonly id: string
  readonly label: string
  readonly type: NodeType
  readonly description?: string
  readonly metadata?: Record<string, string | number>
  readonly x?: number
  readonly y?: number
}

export interface GraphEdge {
  readonly id: string
  readonly source: string
  readonly target: string
  readonly label: string
  readonly weight: number
}

export interface KnowledgeGraph {
  readonly nodes: GraphNode[]
  readonly edges: GraphEdge[]
}

export interface EntityExtraction {
  readonly text: string
  readonly entities: ExtractedEntity[]
}

export interface ExtractedEntity {
  readonly name: string
  readonly type: NodeType
  readonly confidence: number
  readonly startIndex: number
  readonly endIndex: number
}

export interface GraphSearchResult {
  readonly query: string
  readonly nodes: GraphNode[]
  readonly relatedDocuments: { id: string; title: string; relevance: number }[]
}
