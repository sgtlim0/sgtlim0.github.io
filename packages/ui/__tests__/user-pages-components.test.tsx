import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock lucide-react icons
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
    title: 'New',
    assistantId: 'general',
    messages: [],
    createdAt: '2026-03-07',
    updatedAt: '2026-03-07',
  })),
  addMessage: vi.fn(),
  deleteConversation: vi.fn(),
  searchConversations: vi.fn(() => []),
}))

// Mock assistant service
vi.mock('../src/user/services/assistantService', () => ({
  getCustomAssistants: vi.fn(() => []),
  saveCustomAssistant: vi.fn(),
}))

// Mock research service
vi.mock('../src/user/services/researchService', () => ({
  createResearchService: vi.fn(() => ({
    search: vi.fn(),
    cancel: vi.fn(),
  })),
}))

// Mock useNetworkStatus
vi.mock('../src/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: true }),
}))

// Mock useExtensionContext
vi.mock('../src/user/hooks/useExtensionContext', () => ({
  useExtensionContext: () => ({ extensionContext: null, clearContext: vi.fn() }),
}))

// Mock IndexedDB service
vi.mock('../src/services/indexedDbService', () => ({
  getAll: vi.fn(() => Promise.resolve([])),
  put: vi.fn(() => Promise.resolve()),
  deleteItem: vi.fn(() => Promise.resolve()),
}))

describe('User Pages - Extended Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // DocsPage
  // =========================================================================
  describe('DocsPage', () => {
    it('should render page title', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      expect(screen.getByText('문서 작성 도구')).toBeInTheDocument()
    })

    it('should render page description', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      expect(screen.getByText(/AI와 함께 전문적인 문서를 작성/)).toBeInTheDocument()
    })

    it('should display supported formats HWP and DOCX', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      expect(screen.getByText('한글(HWP)')).toBeInTheDocument()
      expect(screen.getByText('워드(DOCX)')).toBeInTheDocument()
    })

    it('should render new project button', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      expect(screen.getByText('새 프로젝트 시작')).toBeInTheDocument()
    })

    it('should render project table with mock projects', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      expect(screen.getByText('2026년 상반기 사업계획서')).toBeInTheDocument()
      expect(screen.getByText('AI 도입 제안서')).toBeInTheDocument()
    })

    it('should render StepProgress with 5 steps', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      expect(screen.getByText('프로젝트 선택')).toBeInTheDocument()
      expect(screen.getByText('파일 선택')).toBeInTheDocument()
      expect(screen.getByText('배경지식 제공')).toBeInTheDocument()
      expect(screen.getByText('목차 및 내용 작성')).toBeInTheDocument()
      expect(screen.getByText('파일 생성')).toBeInTheDocument()
    })

    it('should add a new project when clicking button', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      fireEvent.click(screen.getByText('새 프로젝트 시작'))
      expect(screen.getByText('새 프로젝트')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // MyPage
  // =========================================================================
  describe('MyPage', () => {
    it('should render account heading', async () => {
      const { default: MyPage } = await import('../src/user/pages/MyPage')
      render(<MyPage />)
      expect(screen.getByText('내 계정')).toBeInTheDocument()
    })

    it('should display subscription email from mock data', async () => {
      const { default: MyPage } = await import('../src/user/pages/MyPage')
      render(<MyPage />)
      const emails = screen.getAllByText('wooggi@gmail.com')
      expect(emails.length).toBeGreaterThanOrEqual(1)
    })

    it('should render subscription info heading', async () => {
      const { default: MyPage } = await import('../src/user/pages/MyPage')
      render(<MyPage />)
      expect(screen.getByText('구독 정보')).toBeInTheDocument()
    })

    it('should render usage heading', async () => {
      const { default: MyPage } = await import('../src/user/pages/MyPage')
      render(<MyPage />)
      expect(screen.getByText('이달의 내 상세 사용 현황')).toBeInTheDocument()
    })

    it('should render usage table with model names', async () => {
      const { default: MyPage } = await import('../src/user/pages/MyPage')
      render(<MyPage />)
      expect(screen.getByText('OPENAI_CHAT_GPT4')).toBeInTheDocument()
      expect(screen.getByText('DEEPL_TRANSLATE_FILE')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // OCRPage
  // =========================================================================
  describe('OCRPage', () => {
    it('should render page title', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.getByText('텍스트 추출 (OCR)')).toBeInTheDocument()
    })

    it('should render page description', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.getByText(/이미지에서 글자를 자동으로 추출/)).toBeInTheDocument()
    })

    it('should render mode toggle buttons (extract and translate)', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.getByText('텍스트 추출')).toBeInTheDocument()
      expect(screen.getByText('번역')).toBeInTheDocument()
    })

    it('should render file upload zone description', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.getByText('JPG, JPEG, PNG, PDF 형식 지원')).toBeInTheDocument()
    })

    it('should render info box with max file limit', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.getByText(/최대 5장까지 업로드/)).toBeInTheDocument()
    })

    it('should render disabled start button when no files uploaded', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      const startBtn = screen.getByText('텍스트 추출 시작')
      expect(startBtn).toBeInTheDocument()
      expect(startBtn.closest('button')).toBeDisabled()
    })

    it('should switch to translate mode when clicking translate', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      fireEvent.click(screen.getByText('번역'))
      expect(screen.getByText(/최대 20장까지 업로드/)).toBeInTheDocument()
      expect(screen.getByText('번역 시작')).toBeInTheDocument()
    })

    it('should render step progress with 2 steps', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.getByText('이미지 파일 업로드')).toBeInTheDocument()
      expect(screen.getByText('추출/번역')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // TranslationPage
  // =========================================================================
  describe('TranslationPage', () => {
    it('should render page title', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText('문서 번역 도구')).toBeInTheDocument()
    })

    it('should render page description', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText(/문서를 업로드하면 형식을 유지한 채 번역/)).toBeInTheDocument()
    })

    it('should render supported formats badges', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText('PDF')).toBeInTheDocument()
      expect(screen.getByText('DOCX')).toBeInTheDocument()
      expect(screen.getByText('PPTX')).toBeInTheDocument()
      expect(screen.getByText('XLSX')).toBeInTheDocument()
    })

    it('should render warning banner about AI translation', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText(/AI 번역 특성상 글이 빠질 수 있고/)).toBeInTheDocument()
    })

    it('should render engine selector with two engines', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText('자체 번역 엔진')).toBeInTheDocument()
      expect(screen.getByText('DeepL 번역 엔진')).toBeInTheDocument()
    })

    it('should render disabled start button when no files uploaded', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      // "번역 시작" appears as both step label and button; find the button specifically
      const allMatches = screen.getAllByText('번역 시작')
      const startBtn = allMatches.find((el) => el.closest('button[type="button"]') && el.closest('button[type="button"]')?.classList.contains('w-full'))
      expect(startBtn?.closest('button')).toBeDisabled()
    })

    it('should render file upload description', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText('번역할 문서 파일을 업로드하세요')).toBeInTheDocument()
    })

    it('should render step progress labels', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      // "번역 시작" appears both as step label and button text
      const matches = screen.getAllByText('번역 시작')
      expect(matches.length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText('번역 결과')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ChatPage
  // =========================================================================
  describe('ChatPage', () => {
    it('should render without crashing', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      const { container } = render(<ChatPage />)
      expect(container).toBeTruthy()
    })

    it('should render loading state or main content', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      const { container } = render(<ChatPage />)
      // ChatPage shows loading state initially while useConversations loads
      const hasLoading = container.textContent?.includes('대화를 불러오는 중')
      const hasMainContent = container.textContent?.includes('업무 비서') || container.textContent?.includes('Chat')
      expect(hasLoading || hasMainContent).toBe(true)
    })

    it('should render sidebar navigation', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      const { container } = render(<ChatPage />)
      // The sidebar is always rendered regardless of loading state
      const aside = container.querySelector('aside') || container.querySelector('nav')
      const flexContainer = container.querySelector('.flex.h-screen')
      expect(flexContainer || aside).toBeTruthy()
    })

    it('should render main layout container', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      const { container } = render(<ChatPage />)
      // Main area always exists
      const main = container.querySelector('main')
      expect(main).toBeTruthy()
    })
  })
})
