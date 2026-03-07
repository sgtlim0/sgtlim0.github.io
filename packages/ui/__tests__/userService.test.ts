import { describe, it, expect, vi } from 'vitest'
import { MockUserService } from '../src/user/services/mockUserService'
import type { UserService } from '../src/user/services/userService'

describe('MockUserService', () => {
  const service: UserService = new MockUserService()

  describe('interface compliance', () => {
    it('should implement all UserService methods', () => {
      const methods: (keyof UserService)[] = [
        'getConversations',
        'createConversation',
        'deleteConversation',
        'sendMessage',
        'getAssistants',
        'getCustomAssistants',
        'createAssistant',
        'updateAssistant',
        'deleteAssistant',
        'getUsageStats',
        'getSubscription',
        'getTranslationJobs',
        'getDocProjects',
        'getOCRJobs',
      ]

      methods.forEach((method) => {
        expect(typeof service[method]).toBe('function')
      })
    })
  })

  describe('getAssistants', () => {
    it('should return assistant array', async () => {
      vi.useFakeTimers()
      const promise = service.getAssistants()
      vi.advanceTimersByTime(500)
      const assistants = await promise

      expect(assistants).toBeInstanceOf(Array)
      expect(assistants.length).toBeGreaterThan(0)
      assistants.forEach((a) => {
        expect(a).toHaveProperty('id')
        expect(a).toHaveProperty('name')
      })
      vi.useRealTimers()
    })
  })

  describe('getConversations', () => {
    it('should return conversations array', async () => {
      vi.useFakeTimers()
      const promise = service.getConversations()
      vi.advanceTimersByTime(500)
      const conversations = await promise

      expect(conversations).toBeInstanceOf(Array)
      vi.useRealTimers()
    })
  })

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      vi.useFakeTimers()
      const promise = service.createConversation('general')
      vi.advanceTimersByTime(500)
      const conversation = await promise

      expect(conversation).toHaveProperty('id')
      expect(conversation).toHaveProperty('assistantId')
      vi.useRealTimers()
    })
  })

  describe('getUsageStats', () => {
    it('should return model usage stats', async () => {
      vi.useFakeTimers()
      const promise = service.getUsageStats()
      vi.advanceTimersByTime(500)
      const stats = await promise

      expect(stats).toBeInstanceOf(Array)
      vi.useRealTimers()
    })
  })

  describe('getSubscription', () => {
    it('should return subscription info', async () => {
      vi.useFakeTimers()
      const promise = service.getSubscription()
      vi.advanceTimersByTime(500)
      const sub = await promise

      expect(sub).toBeDefined()
      expect(sub).toHaveProperty('planName')
      vi.useRealTimers()
    })
  })

  describe('getDocProjects', () => {
    it('should return document projects', async () => {
      vi.useFakeTimers()
      const promise = service.getDocProjects()
      vi.advanceTimersByTime(500)
      const projects = await promise

      expect(projects).toBeInstanceOf(Array)
      vi.useRealTimers()
    })
  })

  describe('getOCRJobs', () => {
    it('should return OCR jobs', async () => {
      vi.useFakeTimers()
      const promise = service.getOCRJobs()
      vi.advanceTimersByTime(500)
      const jobs = await promise

      expect(jobs).toBeInstanceOf(Array)
      vi.useRealTimers()
    })
  })
})
