import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  searchDocuments,
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  getRAGConfig,
  getEmbeddingModels,
} from '../src/admin/services/ragService'

describe('ragService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('searchDocuments', () => {
    it('should return search results for matching query', async () => {
      const promise = searchDocuments('AI 모델')
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result).toHaveProperty('query')
      expect(result).toHaveProperty('chunks')
      expect(result).toHaveProperty('totalResults')
      expect(result).toHaveProperty('searchTimeMs')
      expect(result).toHaveProperty('model')
      expect(result.query).toBe('AI 모델')
      expect(result.chunks.length).toBeGreaterThan(0)
    })

    it('should return chunks sorted by relevance', async () => {
      const promise = searchDocuments('AI 모델')
      vi.advanceTimersByTime(500)
      const result = await promise

      for (let i = 0; i < result.chunks.length - 1; i++) {
        expect(result.chunks[i].relevanceScore).toBeGreaterThanOrEqual(
          result.chunks[i + 1].relevanceScore,
        )
      }
    })

    it('should return results for API query', async () => {
      const promise = searchDocuments('API')
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result.chunks.length).toBeGreaterThan(0)
      result.chunks.forEach((c) => {
        expect(c).toHaveProperty('id')
        expect(c).toHaveProperty('documentId')
        expect(c).toHaveProperty('documentTitle')
        expect(c).toHaveProperty('content')
        expect(c).toHaveProperty('relevanceScore')
      })
    })

    it('should respect topK parameter', async () => {
      const promise = searchDocuments('AI 모델', 1)
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result.chunks.length).toBeLessThanOrEqual(1)
    })

    it('should handle no-match queries gracefully', async () => {
      const promise = searchDocuments('zzzznonexistentzzz')
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result.chunks).toHaveLength(0)
      expect(result.totalResults).toBe(0)
    })

    it('should include search time in results', async () => {
      const promise = searchDocuments('보안')
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result.searchTimeMs).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getDocuments', () => {
    it('should return all documents', async () => {
      const promise = getDocuments()
      vi.advanceTimersByTime(300)
      const docs = await promise

      expect(docs.length).toBeGreaterThan(0)
      docs.forEach((d) => {
        expect(d).toHaveProperty('id')
        expect(d).toHaveProperty('title')
        expect(d).toHaveProperty('type')
        expect(d).toHaveProperty('size')
        expect(d).toHaveProperty('chunkCount')
        expect(d).toHaveProperty('status')
        expect(d).toHaveProperty('tags')
      })
    })

    it('should include various document types', async () => {
      const promise = getDocuments()
      vi.advanceTimersByTime(300)
      const docs = await promise

      const types = docs.map((d) => d.type)
      expect(types).toContain('pdf')
      expect(types).toContain('docx')
      expect(types).toContain('md')
    })
  })

  describe('getDocumentById', () => {
    it('should return document for valid ID', async () => {
      const promise = getDocumentById('doc-1')
      vi.advanceTimersByTime(200)
      const doc = await promise

      expect(doc).not.toBeNull()
      expect(doc?.id).toBe('doc-1')
      expect(doc?.title).toContain('H Chat')
    })

    it('should return null for invalid ID', async () => {
      const promise = getDocumentById('non-existent')
      vi.advanceTimersByTime(200)
      const doc = await promise

      expect(doc).toBeNull()
    })
  })

  describe('uploadDocument', () => {
    it('should create document from file info', async () => {
      const promise = uploadDocument({
        name: 'test-doc.pdf',
        size: 1500000,
        type: 'application/pdf',
      })
      vi.advanceTimersByTime(600)
      const doc = await promise

      expect(doc.id).toBeTruthy()
      expect(doc.title).toBe('test-doc.pdf')
      expect(doc.type).toBe('pdf')
      expect(doc.size).toBe(1500000)
      expect(doc.status).toBe('processing')
      expect(doc.chunkCount).toBe(0)
      expect(doc.tags).toEqual([])
    })
  })

  describe('deleteDocument', () => {
    it('should return true for existing document', async () => {
      const promise = deleteDocument('doc-1')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(true)
    })

    it('should return false for non-existent document', async () => {
      const promise = deleteDocument('non-existent')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(false)
    })
  })

  describe('getRAGConfig', () => {
    it('should return RAG configuration', () => {
      const config = getRAGConfig()

      expect(config).toHaveProperty('embeddingModel')
      expect(config).toHaveProperty('chunkSize')
      expect(config).toHaveProperty('chunkOverlap')
      expect(config).toHaveProperty('topK')
      expect(config).toHaveProperty('minRelevanceScore')
      expect(config).toHaveProperty('hybridSearch')
      expect(config.chunkSize).toBeGreaterThan(0)
      expect(config.chunkOverlap).toBeLessThan(config.chunkSize)
    })
  })

  describe('getEmbeddingModels', () => {
    it('should return embedding models', async () => {
      const promise = getEmbeddingModels()
      vi.advanceTimersByTime(200)
      const models = await promise

      expect(models.length).toBeGreaterThan(0)
      models.forEach((m) => {
        expect(m).toHaveProperty('id')
        expect(m).toHaveProperty('name')
        expect(m).toHaveProperty('provider')
        expect(m).toHaveProperty('dimensions')
        expect(m).toHaveProperty('maxTokens')
        expect(m).toHaveProperty('pricePerMToken')
        expect(m.dimensions).toBeGreaterThan(0)
      })
    })
  })
})
