import { describe, it, expect } from 'vitest'
import { chatRequestSchema, researchRequestSchema, chatMessageSchema } from '../src/schemas/chat'

describe('chatMessageSchema', () => {
  it('should accept a valid user message', () => {
    const result = chatMessageSchema.safeParse({
      role: 'user',
      content: 'Hello',
    })
    expect(result.success).toBe(true)
  })

  it('should accept a valid assistant message', () => {
    const result = chatMessageSchema.safeParse({
      role: 'assistant',
      content: 'Hi there!',
    })
    expect(result.success).toBe(true)
  })

  it('should reject an invalid role', () => {
    const result = chatMessageSchema.safeParse({
      role: 'system',
      content: 'Hello',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty content', () => {
    const result = chatMessageSchema.safeParse({
      role: 'user',
      content: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('chatRequestSchema', () => {
  it('should accept a valid request', () => {
    const result = chatRequestSchema.safeParse({
      message: 'Hello, how are you?',
    })
    expect(result.success).toBe(true)
  })

  it('should accept a full valid request with all fields', () => {
    const result = chatRequestSchema.safeParse({
      message: 'Hello',
      assistantId: 'chat-001',
      conversationId: 'conv_123',
      history: [{ role: 'user', content: 'Hi' }],
      use_compression: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toBe('Hello')
      expect(result.data.assistantId).toBe('chat-001')
      expect(result.data.use_compression).toBe(false)
    }
  })

  it('should reject empty message', () => {
    const result = chatRequestSchema.safeParse({
      message: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messageError = result.error.issues.find((issue) => issue.path.includes('message'))
      expect(messageError).toBeDefined()
    }
  })

  it('should reject message exceeding 10000 characters', () => {
    const result = chatRequestSchema.safeParse({
      message: 'a'.repeat(10001),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messageError = result.error.issues.find((issue) => issue.path.includes('message'))
      expect(messageError).toBeDefined()
    }
  })

  it('should accept message with exactly 10000 characters', () => {
    const result = chatRequestSchema.safeParse({
      message: 'a'.repeat(10000),
    })
    expect(result.success).toBe(true)
  })

  it('should default history to empty array', () => {
    const result = chatRequestSchema.safeParse({
      message: 'Hello',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.history).toEqual([])
    }
  })

  it('should reject history exceeding 50 items', () => {
    const history = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
    }))
    const result = chatRequestSchema.safeParse({
      message: 'Hello',
      history,
    })
    expect(result.success).toBe(false)
  })

  it('should accept history with exactly 50 items', () => {
    const history = Array.from({ length: 50 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
    }))
    const result = chatRequestSchema.safeParse({
      message: 'Hello',
      history,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.history).toHaveLength(50)
    }
  })

  it('should default use_compression to true', () => {
    const result = chatRequestSchema.safeParse({
      message: 'Hello',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.use_compression).toBe(true)
    }
  })

  it('should reject invalid history items', () => {
    const result = chatRequestSchema.safeParse({
      message: 'Hello',
      history: [{ role: 'invalid', content: 'test' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('researchRequestSchema', () => {
  it('should accept a valid request', () => {
    const result = researchRequestSchema.safeParse({
      query: 'AI strategy',
    })
    expect(result.success).toBe(true)
  })

  it('should accept a request with num_sources', () => {
    const result = researchRequestSchema.safeParse({
      query: 'AI strategy',
      num_sources: 5,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.num_sources).toBe(5)
    }
  })

  it('should reject empty query', () => {
    const result = researchRequestSchema.safeParse({
      query: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const queryError = result.error.issues.find((issue) => issue.path.includes('query'))
      expect(queryError).toBeDefined()
    }
  })

  it('should reject query exceeding 2000 characters', () => {
    const result = researchRequestSchema.safeParse({
      query: 'a'.repeat(2001),
    })
    expect(result.success).toBe(false)
  })

  it('should default num_sources to 3', () => {
    const result = researchRequestSchema.safeParse({
      query: 'test',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.num_sources).toBe(3)
    }
  })

  it('should reject num_sources less than 1', () => {
    const result = researchRequestSchema.safeParse({
      query: 'test',
      num_sources: 0,
    })
    expect(result.success).toBe(false)
  })

  it('should reject num_sources greater than 10', () => {
    const result = researchRequestSchema.safeParse({
      query: 'test',
      num_sources: 11,
    })
    expect(result.success).toBe(false)
  })

  it('should accept num_sources at boundary 1', () => {
    const result = researchRequestSchema.safeParse({
      query: 'test',
      num_sources: 1,
    })
    expect(result.success).toBe(true)
  })

  it('should accept num_sources at boundary 10', () => {
    const result = researchRequestSchema.safeParse({
      query: 'test',
      num_sources: 10,
    })
    expect(result.success).toBe(true)
  })

  it('should reject non-integer num_sources', () => {
    const result = researchRequestSchema.safeParse({
      query: 'test',
      num_sources: 3.5,
    })
    expect(result.success).toBe(false)
  })
})
