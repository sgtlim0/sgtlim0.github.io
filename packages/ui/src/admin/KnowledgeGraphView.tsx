'use client'

import { useState } from 'react'
import type { KnowledgeGraph, GraphNode } from './services/knowledgeGraphTypes'
import { getKnowledgeGraph, searchGraph, extractEntities } from './services/knowledgeGraphService'
import { useAsyncData } from '../hooks/useAsyncData'

const NODE_COLORS: Record<string, string> = {
  project: '#3B82F6',
  concept: '#8B5CF6',
  person: '#10B981',
  document: '#F59E0B',
  tag: '#6B7280',
}

export default function KnowledgeGraphView() {
  const { data: initialGraph, loading } = useAsyncData<KnowledgeGraph>(
    () => getKnowledgeGraph(),
    [],
  )
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [extractText, setExtractText] = useState('')

  const currentGraph = graph ?? initialGraph

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    const result = await searchGraph(searchQuery)
    setGraph({
      nodes: result.nodes,
      edges:
        currentGraph?.edges.filter((e) =>
          result.nodes.some((n) => n.id === e.source || n.id === e.target),
        ) ?? [],
    })
  }

  const handleExtract = async () => {
    if (!extractText.trim()) return
    const result = await extractEntities(extractText)
    alert(
      `${result.entities.length}개 엔티티 추출: ${result.entities.map((e) => `${e.name}(${e.type})`).join(', ')}`,
    )
  }

  if (loading || !currentGraph)
    return <div className="p-8 text-center text-text-secondary">지식 그래프 로딩 중...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">지식 그래프</h2>
        <p className="text-sm text-text-secondary mt-1">
          {currentGraph.nodes.length}개 노드, {currentGraph.edges.length}개 관계
        </p>
      </div>

      {/* Search & Extract */}
      <div className="flex gap-3">
        <div className="flex-1 flex gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="노드 검색..."
            aria-label="그래프 검색"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-admin-bg-card text-text-primary"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-xs rounded-lg bg-admin-teal text-white"
          >
            검색
          </button>
        </div>
      </div>

      {/* Graph Visualization (CSS-based mock) */}
      <div className="relative rounded-xl border border-border bg-admin-bg-section p-8 min-h-[400px] overflow-hidden">
        {currentGraph.nodes.map((node, i) => {
          const x = 50 + (i % 4) * 200 + ((i * 17) % 40)
          const y = 50 + Math.floor(i / 4) * 120 + ((i * 31) % 30)
          const isSelected = selectedNode?.id === node.id
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(isSelected ? null : node)}
              className={`absolute flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all cursor-pointer ${isSelected ? 'ring-2 ring-admin-teal scale-110 z-10' : 'hover:scale-105'}`}
              style={{
                left: x,
                top: y,
                borderColor: NODE_COLORS[node.type] ?? '#6B7280',
                backgroundColor: `${NODE_COLORS[node.type] ?? '#6B7280'}15`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: NODE_COLORS[node.type] }}
              />
              <span className="text-text-primary">{node.label}</span>
            </button>
          )
        })}
      </div>

      {/* Node Detail */}
      {selectedNode && (
        <div className="p-4 rounded-xl border border-admin-teal/30 bg-admin-teal/5">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}
            />
            <span className="text-sm font-bold text-text-primary">{selectedNode.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-admin-bg-section text-text-secondary">
              {selectedNode.type}
            </span>
          </div>
          {selectedNode.description && (
            <p className="text-xs text-text-secondary">{selectedNode.description}</p>
          )}
          <p className="text-xs text-text-tertiary mt-2">
            연결:{' '}
            {
              currentGraph.edges.filter(
                (e) => e.source === selectedNode.id || e.target === selectedNode.id,
              ).length
            }
            개
          </p>
        </div>
      )}

      {/* Entity Extraction */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-text-primary">NER 엔티티 추출</h3>
        <div className="flex gap-2">
          <textarea
            value={extractText}
            onChange={(e) => setExtractText(e.target.value)}
            placeholder="텍스트를 입력하면 엔티티를 자동 추출합니다..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-admin-bg-card text-text-primary resize-none"
            rows={2}
          />
          <button
            onClick={handleExtract}
            className="px-4 py-2 text-xs rounded-lg bg-admin-bg-section text-text-secondary hover:text-text-primary self-end"
          >
            추출
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-text-secondary">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
