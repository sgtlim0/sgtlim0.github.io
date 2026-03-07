'use client'

import { useState } from 'react'
import type { RAGSearchResult, RAGDocument } from './services/ragTypes'
import { searchDocuments, getDocuments } from './services/ragService'

export default function RAGSearchPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<RAGSearchResult | null>(null)
  const [documents, setDocuments] = useState<RAGDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [showDocs, setShowDocs] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    const res = await searchDocuments(query)
    setResult(res)
    setLoading(false)
  }

  const loadDocuments = async () => {
    const docs = await getDocuments()
    setDocuments(docs)
    setShowDocs(true)
  }

  const STATUS_COLORS: Record<string, string> = {
    indexed: 'bg-green-100 text-green-700',
    processing: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">RAG 문서 검색</h2>
          <p className="text-sm text-text-secondary mt-1">벡터 DB 기반 시맨틱 검색</p>
        </div>
        <button
          onClick={loadDocuments}
          className="px-4 py-2 text-xs rounded-lg bg-admin-bg-section text-text-secondary hover:text-text-primary transition-colors"
        >
          문서 관리
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="검색어를 입력하세요 (예: AI 모델, API, 보안)"
          aria-label="RAG 검색"
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-admin-bg-card text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-admin-teal"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-3 rounded-xl bg-admin-teal text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">{result.totalResults}건</strong> 결과 (
              {result.searchTimeMs}ms)
            </p>
            <span className="text-xs text-text-tertiary">모델: {result.model}</span>
          </div>

          {result.chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="p-4 rounded-xl border border-border bg-admin-bg-card hover:border-admin-teal/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-admin-teal">{chunk.documentTitle}</span>
                <span className="text-xs text-text-tertiary">| {chunk.section}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-admin-teal/10 text-admin-teal font-medium">
                  {Math.round(chunk.relevanceScore * 100)}% 관련
                </span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">{chunk.content}</p>
            </div>
          ))}

          {result.chunks.length === 0 && (
            <p className="py-8 text-center text-text-secondary text-sm">검색 결과가 없습니다.</p>
          )}
        </div>
      )}

      {/* Document Management */}
      {showDocs && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-text-primary">
            인덱싱된 문서 ({documents.length}개)
          </h3>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-admin-bg-section border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    문서명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    유형
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    청크
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-border-light hover:bg-admin-table-hover"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">{doc.title}</td>
                    <td className="px-4 py-3 text-text-secondary uppercase text-xs">{doc.type}</td>
                    <td className="px-4 py-3 text-text-primary tabular-nums">{doc.chunkCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[doc.status] ?? ''}`}
                      >
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
