import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock lucide-react - return proxy for any icon
vi.mock('lucide-react', async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>()
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(target, name) {
      if (typeof name === 'string' && name in target) return target[name]
      if (typeof name === 'string' && /^[A-Z]/.test(name)) {
        const IconMock = function MockIcon(props: Record<string, unknown>) {
          return <span data-testid={`icon-${String(name)}`} {...props} />
        }
        IconMock.displayName = `Mock${String(name)}`
        return IconMock
      }
      return target[name as keyof typeof target]
    },
  }
  return new Proxy({ ...mod }, handler)
})

// Mock SSE service
vi.mock('../src/user/services/sseService', () => ({
  streamResponse: vi.fn(),
}))

// Mock chat service
vi.mock('../src/user/services/chatService', () => ({
  getConversations: vi.fn(() => []),
  saveConversations: vi.fn(),
  createConversation: vi.fn(() => ({
    id: 'conv-1',
    title: '새 대화',
    assistantId: 'general',
    messages: [],
    createdAt: '2026-03-07',
    updatedAt: '2026-03-07',
  })),
  addMessage: vi.fn(),
  deleteConversation: vi.fn(),
}))

// Mock assistant service
vi.mock('../src/user/services/assistantService', () => ({
  getCustomAssistants: vi.fn(() => []),
  saveCustomAssistant: vi.fn(),
}))

describe('User Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ChatPage', () => {
    it('should render without crashing', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      const { container } = render(<ChatPage />)
      expect(container).toBeTruthy()
    }, 15000)
  })

  describe('DocsPage', () => {
    it('should render without crashing', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      const { container } = render(<DocsPage />)
      expect(container).toBeTruthy()
    }, 15000)
  })

  describe('MyPage', () => {
    it('should render without crashing', async () => {
      const { default: MyPage } = await import('../src/user/pages/MyPage')
      const { container } = render(<MyPage />)
      expect(container).toBeTruthy()
    }, 15000)
  })

  describe('OCRPage', () => {
    it('should render without crashing', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      const { container } = render(<OCRPage />)
      expect(container).toBeTruthy()
    }, 15000)
  })

  describe('TranslationPage', () => {
    it('should render without crashing', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      const { container } = render(<TranslationPage />)
      expect(container).toBeTruthy()
    }, 15000)
  })
})
