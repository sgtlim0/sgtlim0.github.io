import { describe, it, expect, beforeEach } from 'vitest'
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
    localStorage.clear()
  })

  describe('getPromptVersions', () => {
    it('should return all prompts', async () => {
      const prompts = await getPromptVersions()
      expect(prompts.length).toBe(3)
    })

    it('should include version history', async () => {
      const prompts = await getPromptVersions()
      prompts.forEach((p) => {
        expect(p.versions.length).toBeGreaterThan(0)
        expect(p.currentVersion).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('getPromptById', () => {
    it('should return prompt for valid id', async () => {
      const prompt = await getPromptById('prompt-translate')
      expect(prompt).not.toBeNull()
      expect(prompt!.name).toBe('번역 프롬프트')
      expect(prompt!.versions.length).toBe(3)
    })

    it('should return null for invalid id', async () => {
      const prompt = await getPromptById('nonexistent')
      expect(prompt).toBeNull()
    })
  })

  describe('createVersion', () => {
    it('should create a new version', async () => {
      const newVersion = await createVersion(
        'prompt-translate',
        '새로운 프롬프트 내용',
        '새로운 시스템 프롬프트',
        'GPT-4o',
        '테스트 업데이트',
      )

      expect(newVersion).not.toBeNull()
      expect(newVersion!.version).toBe(4)
      expect(newVersion!.content).toBe('새로운 프롬프트 내용')
    })

    it('should persist new version', async () => {
      await createVersion('prompt-translate', 'content', 'system', 'GPT-4o', 'test')

      const prompt = await getPromptById('prompt-translate')
      expect(prompt!.versions.length).toBe(4)
      expect(prompt!.currentVersion).toBe(4)
    })

    it('should return null for invalid prompt id', async () => {
      const result = await createVersion('nonexistent', 'c', 's', 'model', 'note')
      expect(result).toBeNull()
    })
  })

  describe('rollbackToVersion', () => {
    it('should rollback active version', async () => {
      const result = await rollbackToVersion('prompt-translate', 1)
      expect(result).toBe(true)

      const prompt = await getPromptById('prompt-translate')
      expect(prompt!.activeVersion).toBe(1)
    })

    it('should return false for invalid version', async () => {
      const result = await rollbackToVersion('prompt-translate', 999)
      expect(result).toBe(false)
    })

    it('should return false for invalid prompt id', async () => {
      const result = await rollbackToVersion('nonexistent', 1)
      expect(result).toBe(false)
    })
  })

  describe('diffVersions', () => {
    it('should detect unchanged lines', () => {
      const diffs = diffVersions('line1\nline2', 'line1\nline2')
      expect(diffs.every((d) => d.type === 'unchanged')).toBe(true)
    })

    it('should detect added lines', () => {
      const diffs = diffVersions('line1', 'line1\nline2')
      expect(diffs.some((d) => d.type === 'added')).toBe(true)
    })

    it('should detect removed lines', () => {
      const diffs = diffVersions('line1\nline2', 'line1')
      expect(diffs.some((d) => d.type === 'removed')).toBe(true)
    })

    it('should detect changed lines', () => {
      const diffs = diffVersions('old content', 'new content')
      expect(diffs.some((d) => d.type === 'removed' && d.content === 'old content')).toBe(true)
      expect(diffs.some((d) => d.type === 'added' && d.content === 'new content')).toBe(true)
    })
  })

  describe('getABTests', () => {
    it('should return all AB tests', async () => {
      const tests = await getABTests()
      expect(tests.length).toBe(2)
    })

    it('should filter by prompt id', async () => {
      const tests = await getABTests('prompt-translate')
      expect(tests.length).toBe(1)
      expect(tests[0].promptId).toBe('prompt-translate')
    })

    it('should include results for completed tests', async () => {
      const tests = await getABTests()
      const completed = tests.find((t) => t.status === 'completed')
      expect(completed?.results).toBeDefined()
      expect(completed!.results!.winner).toBe('B')
    })
  })

  describe('createABTest', () => {
    it('should create a new AB test', async () => {
      const test = await createABTest({
        promptId: 'prompt-summary',
        name: '새 테스트',
        versionA: 1,
        versionB: 2,
        trafficSplitA: 50,
      })

      expect(test.id).toMatch(/^ab-/)
      expect(test.status).toBe('draft')
      expect(test.name).toBe('새 테스트')
    })
  })
})
