import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCustomAssistants,
  saveCustomAssistant,
  updateCustomAssistant,
  deleteCustomAssistant,
} from '../src/user/services/assistantService'

describe('assistantService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getCustomAssistants', () => {
    it('should return empty array when no assistants stored', () => {
      const result = getCustomAssistants()
      expect(result).toEqual([])
    })

    it('should return stored assistants', () => {
      const assistants = [{ id: 'custom_1', name: 'Test', description: 'desc', isOfficial: false }]
      localStorage.setItem('hchat-custom-assistants', JSON.stringify(assistants))

      const result = getCustomAssistants()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Test')
    })

    it('should return empty array for invalid JSON', () => {
      localStorage.setItem('hchat-custom-assistants', 'invalid')
      const result = getCustomAssistants()
      expect(result).toEqual([])
    })
  })

  describe('saveCustomAssistant', () => {
    it('should save a new assistant with generated id', () => {
      const result = saveCustomAssistant({
        name: 'My Bot',
        description: '테스트 봇',
        emoji: '🤖',
        color: '#ff0000',
        systemPrompt: 'You are helpful',
        category: 'chat',
      })

      expect(result.id).toMatch(/^custom_/)
      expect(result.name).toBe('My Bot')
      expect(result.isOfficial).toBe(false)
    })

    it('should persist to localStorage', () => {
      saveCustomAssistant({
        name: 'Bot A',
        description: 'A',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'prompt',
        category: 'chat',
      })

      const stored = JSON.parse(localStorage.getItem('hchat-custom-assistants')!)
      expect(stored).toHaveLength(1)
      expect(stored[0].name).toBe('Bot A')
    })

    it('should append to existing assistants', () => {
      saveCustomAssistant({
        name: 'Bot A',
        description: 'A',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'a',
        category: 'chat',
      })
      saveCustomAssistant({
        name: 'Bot B',
        description: 'B',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'b',
        category: 'work',
      })

      const result = getCustomAssistants()
      expect(result).toHaveLength(2)
    })
  })

  describe('updateCustomAssistant', () => {
    it('should update an existing assistant', () => {
      const created = saveCustomAssistant({
        name: 'Original',
        description: 'desc',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'prompt',
        category: 'chat',
      })

      const updated = updateCustomAssistant(created.id, { name: 'Updated' })
      const found = updated.find((a) => a.id === created.id)

      expect(found).toBeDefined()
      expect(found!.name).toBe('Updated')
      expect(found!.isOfficial).toBe(false)
    })

    it('should not modify other assistants', () => {
      const a = saveCustomAssistant({
        name: 'A',
        description: 'a',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'a',
        category: 'chat',
      })
      const b = saveCustomAssistant({
        name: 'B',
        description: 'b',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'b',
        category: 'chat',
      })

      updateCustomAssistant(a.id, { name: 'A Updated' })
      const stored = getCustomAssistants()
      const bStored = stored.find((x) => x.id === b.id)

      expect(bStored!.name).toBe('B')
    })

    it('should preserve id on update', () => {
      const created = saveCustomAssistant({
        name: 'Test',
        description: 'desc',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'prompt',
        category: 'chat',
      })

      const updated = updateCustomAssistant(created.id, { id: 'hacked_id' } as Partial<
        typeof created
      >)
      const found = updated.find((a) => a.id === created.id)

      expect(found).toBeDefined()
      expect(found!.id).toBe(created.id)
    })
  })

  describe('deleteCustomAssistant', () => {
    it('should delete an assistant', () => {
      const created = saveCustomAssistant({
        name: 'To Delete',
        description: 'desc',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'prompt',
        category: 'chat',
      })

      const remaining = deleteCustomAssistant(created.id)
      expect(remaining).toHaveLength(0)
    })

    it('should only delete the specified assistant', () => {
      saveCustomAssistant({
        name: 'Keep',
        description: 'keep',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'keep',
        category: 'chat',
      })
      const toDelete = saveCustomAssistant({
        name: 'Delete',
        description: 'del',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'del',
        category: 'chat',
      })

      const remaining = deleteCustomAssistant(toDelete.id)
      expect(remaining).toHaveLength(1)
      expect(remaining[0].name).toBe('Keep')
    })

    it('should handle deleting non-existent id', () => {
      saveCustomAssistant({
        name: 'Exists',
        description: 'yes',
        emoji: '🤖',
        color: '#000',
        systemPrompt: 'yes',
        category: 'chat',
      })

      const remaining = deleteCustomAssistant('non-existent-id')
      expect(remaining).toHaveLength(1)
    })
  })
})
