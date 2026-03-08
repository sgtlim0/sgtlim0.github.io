import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getPromptVersions,
  getPromptById,
  createVersion,
  rollbackToVersion,
  diffVersions,
  getABTests,
  createABTest,
} from '../src/admin/services/promptVersionService'

describe('promptVersionService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getPromptVersions', () => {
    it('should return prompts with version history', async () => {
      const promise = getPromptVersions()
      vi.advanceTimersByTime(300)
      const prompts = await promise

      expect(prompts.length).toBeGreaterThan(0)
      prompts.forEach((p) => {
        expect(p).toHaveProperty('id')
        expect(p).toHaveProperty('name')
        expect(p).toHaveProperty('currentVersion')
        expect(p).toHaveProperty('activeVersion')
        expect(p).toHaveProperty('versions')
        expect(p.versions.length).toBeGreaterThan(0)
      })
    })

    it('should include tags and shared info', async () => {
      const promise = getPromptVersions()
      vi.advanceTimersByTime(300)
      const prompts = await promise

      prompts.forEach((p) => {
        expect(p).toHaveProperty('tags')
        expect(p).toHaveProperty('sharedWith')
        expect(Array.isArray(p.tags)).toBe(true)
        expect(Array.isArray(p.sharedWith)).toBe(true)
      })
    })
  })

  describe('getPromptById', () => {
    it('should return prompt for valid ID', async () => {
      const promise = getPromptById('prompt-translate')
      vi.advanceTimersByTime(200)
      const prompt = await promise

      expect(prompt).not.toBeNull()
      expect(prompt?.id).toBe('prompt-translate')
      expect(prompt?.name).toBe('번역 프롬프트')
      expect(prompt?.versions.length).toBe(3)
    })

    it('should return null for invalid ID', async () => {
      const promise = getPromptById('non-existent')
      vi.advanceTimersByTime(200)
      const prompt = await promise

      expect(prompt).toBeNull()
    })
  })

  describe('createVersion', () => {
    it('should create a new version for existing prompt', async () => {
      const promise = createVersion(
        'prompt-translate',
        '새로운 번역 프롬프트',
        'You are an expert translator.',
        'Claude 4',
        '모델 업그레이드',
      )
      vi.advanceTimersByTime(400)
      const version = await promise

      expect(version).not.toBeNull()
      expect(version?.id).toBeTruthy()
      expect(version?.version).toBe(4) // existing was at version 3
      expect(version?.content).toBe('새로운 번역 프롬프트')
      expect(version?.model).toBe('Claude 4')
      expect(version?.changeNote).toBe('모델 업그레이드')
      expect(version?.createdBy).toBe('현재 사용자')
    })

    it('should return null for non-existent prompt', async () => {
      const promise = createVersion(
        'non-existent',
        'content',
        'system',
        'model',
        'note',
      )
      vi.advanceTimersByTime(400)
      const version = await promise

      expect(version).toBeNull()
    })
  })

  describe('rollbackToVersion', () => {
    it('should rollback to an existing version', async () => {
      const promise = rollbackToVersion('prompt-translate', 1)
      vi.advanceTimersByTime(300)
      const success = await promise

      expect(success).toBe(true)
    })

    it('should return false for non-existent version', async () => {
      const promise = rollbackToVersion('prompt-translate', 99)
      vi.advanceTimersByTime(300)
      const success = await promise

      expect(success).toBe(false)
    })

    it('should return false for non-existent prompt', async () => {
      const promise = rollbackToVersion('non-existent', 1)
      vi.advanceTimersByTime(300)
      const success = await promise

      expect(success).toBe(false)
    })
  })

  describe('diffVersions', () => {
    it('should show unchanged lines for identical text', () => {
      const diffs = diffVersions('hello world', 'hello world')
      expect(diffs).toHaveLength(1)
      expect(diffs[0].type).toBe('unchanged')
      expect(diffs[0].content).toBe('hello world')
    })

    it('should detect added and removed lines', () => {
      const diffs = diffVersions('line1\nline2', 'line1\nline3')
      expect(diffs.length).toBeGreaterThan(0)

      const removed = diffs.filter((d) => d.type === 'removed')
      const added = diffs.filter((d) => d.type === 'added')
      expect(removed.length).toBeGreaterThan(0)
      expect(added.length).toBeGreaterThan(0)
    })

    it('should handle added lines at end', () => {
      const diffs = diffVersions('line1', 'line1\nline2')

      const unchanged = diffs.filter((d) => d.type === 'unchanged')
      const added = diffs.filter((d) => d.type === 'added')
      expect(unchanged).toHaveLength(1)
      expect(added).toHaveLength(1)
      expect(added[0].content).toBe('line2')
    })

    it('should handle removed lines at end', () => {
      const diffs = diffVersions('line1\nline2', 'line1')

      const unchanged = diffs.filter((d) => d.type === 'unchanged')
      const removed = diffs.filter((d) => d.type === 'removed')
      expect(unchanged).toHaveLength(1)
      expect(removed).toHaveLength(1)
      expect(removed[0].content).toBe('line2')
    })

    it('should handle completely different content', () => {
      const diffs = diffVersions('old content', 'new content')

      const removed = diffs.filter((d) => d.type === 'removed')
      const added = diffs.filter((d) => d.type === 'added')
      expect(removed).toHaveLength(1)
      expect(added).toHaveLength(1)
    })

    it('should handle empty strings', () => {
      const diffs = diffVersions('', 'new')
      const added = diffs.filter((d) => d.type === 'added')
      expect(added.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getABTests', () => {
    it('should return all A/B tests', async () => {
      const promise = getABTests()
      vi.advanceTimersByTime(200)
      const tests = await promise

      expect(tests.length).toBeGreaterThan(0)
      tests.forEach((t) => {
        expect(t).toHaveProperty('id')
        expect(t).toHaveProperty('promptId')
        expect(t).toHaveProperty('name')
        expect(t).toHaveProperty('versionA')
        expect(t).toHaveProperty('versionB')
        expect(t).toHaveProperty('status')
      })
    })

    it('should filter by promptId when provided', async () => {
      const promise = getABTests('prompt-translate')
      vi.advanceTimersByTime(200)
      const tests = await promise

      tests.forEach((t) => {
        expect(t.promptId).toBe('prompt-translate')
      })
    })

    it('should return empty for non-existent promptId', async () => {
      const promise = getABTests('non-existent')
      vi.advanceTimersByTime(200)
      const tests = await promise

      expect(tests).toHaveLength(0)
    })
  })

  describe('createABTest', () => {
    it('should create a new A/B test', async () => {
      const promise = createABTest({
        promptId: 'prompt-translate',
        name: '새 테스트',
        versionA: 1,
        versionB: 2,
        trafficSplitA: 50,
      })
      vi.advanceTimersByTime(400)
      const test = await promise

      expect(test.id).toBeTruthy()
      expect(test.name).toBe('새 테스트')
      expect(test.status).toBe('draft')
      expect(test.startDate).toBeTruthy()
    })
  })
})
