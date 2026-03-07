import { describe, it, expect } from 'vitest'
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
  describe('searchDocuments', () => {
    it('should return results for matching query', async () => {
      const result = await searchDocuments('AI 모델')
      expect(result.chunks.length).toBeGreaterThan(0)
      expect(result.query).toBe('AI 모델')
      expect(result.searchTimeMs).toBeGreaterThanOrEqual(0)
    })

    it('should return results for API query', async () => {
      const result = await searchDocuments('API')
      expect(result.chunks.length).toBeGreaterThan(0)
      result.chunks.forEach((c) => {
        expect(c.relevanceScore).toBeGreaterThan(0)
      })
    })

    it('should return results for security query', async () => {
      const result = await searchDocuments('보안')
      expect(result.chunks.length).toBeGreaterThan(0)
    })

    it('should sort by relevance score', async () => {
      const result = await searchDocuments('AI 모델')
      for (let i = 1; i < result.chunks.length; i++) {
        expect(result.chunks[i].relevanceScore).toBeLessThanOrEqual(
          result.chunks[i - 1].relevanceScore,
        )
      }
    })

    it('should respect topK limit', async () => {
      const result = await searchDocuments('AI', 2)
      expect(result.chunks.length).toBeLessThanOrEqual(2)
    })

    it('should return empty for no match', async () => {
      const result = await searchDocuments('xyznonexistent999')
      expect(result.chunks.length).toBe(0)
    })

    it('should include document metadata in chunks', async () => {
      const result = await searchDocuments('API')
      result.chunks.forEach((c) => {
        expect(c.documentId).toBeDefined()
        expect(c.documentTitle).toBeDefined()
        expect(c.section).toBeDefined()
        expect(c.content.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getDocuments', () => {
    it('should return all documents', async () => {
      const docs = await getDocuments()
      expect(docs.length).toBeGreaterThan(0)
    })

    it('should include document metadata', async () => {
      const docs = await getDocuments()
      docs.forEach((d) => {
        expect(d.id).toBeDefined()
        expect(d.title).toBeDefined()
        expect(d.type).toBeDefined()
        expect(d.status).toMatch(/indexed|processing|failed/)
      })
    })
  })

  describe('getDocumentById', () => {
    it('should return document for valid id', async () => {
      const doc = await getDocumentById('doc-1')
      expect(doc).not.toBeNull()
      expect(doc!.title).toContain('사용자 가이드')
    })

    it('should return null for invalid id', async () => {
      const doc = await getDocumentById('nonexistent')
      expect(doc).toBeNull()
    })
  })

  describe('uploadDocument', () => {
    it('should create document with processing status', async () => {
      const doc = await uploadDocument({ name: 'test.pdf', size: 1000, type: 'application/pdf' })
      expect(doc.title).toBe('test.pdf')
      expect(doc.status).toBe('processing')
      expect(doc.type).toBe('pdf')
    })
  })

  describe('deleteDocument', () => {
    it('should return true for existing document', async () => {
      const result = await deleteDocument('doc-1')
      expect(result).toBe(true)
    })

    it('should return false for non-existent document', async () => {
      const result = await deleteDocument('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('getRAGConfig', () => {
    it('should return config with all fields', () => {
      const config = getRAGConfig()
      expect(config.embeddingModel).toBeDefined()
      expect(config.chunkSize).toBeGreaterThan(0)
      expect(config.topK).toBeGreaterThan(0)
      expect(typeof config.hybridSearch).toBe('boolean')
    })
  })

  describe('getEmbeddingModels', () => {
    it('should return available models', async () => {
      const models = await getEmbeddingModels()
      expect(models.length).toBeGreaterThan(0)
      models.forEach((m) => {
        expect(m.dimensions).toBeGreaterThan(0)
        expect(m.provider).toBeDefined()
      })
    })
  })
})
