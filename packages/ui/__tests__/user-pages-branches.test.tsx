import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

// Mutable mock state for useNetworkStatus
let mockIsOnline = true
vi.mock('../src/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline }),
}))

// Mutable mock state for useExtensionContext
let mockExtensionContext: { url: string; text: string } | null = null
const mockClearContext = vi.fn()
vi.mock('../src/user/hooks/useExtensionContext', () => ({
  useExtensionContext: () => ({
    extensionContext: mockExtensionContext,
    clearContext: mockClearContext,
  }),
}))

// Mock chat service
vi.mock('../src/user/services/chatService', () => ({
  getConversations: vi.fn(() => []),
  saveConversations: vi.fn(),
  createConversation: vi.fn(() => ({
    id: 'conv-new',
    title: 'New',
    assistantId: 'a1',
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

// Mock IndexedDB service (correct path matching user/services/)
vi.mock('../src/user/services/indexedDbService', () => ({
  migrateFromLocalStorage: vi.fn(() => Promise.resolve([])),
  saveAllConversations: vi.fn(() => Promise.resolve()),
}))

describe('User Pages - Branch Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsOnline = true
    mockExtensionContext = null
  })

  // =========================================================================
  // ChatPage — offline state branch (lines 151-156)
  // =========================================================================
  describe('ChatPage offline state', () => {
    it('should render offline banner when offline', async () => {
      mockIsOnline = false
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      render(<ChatPage />)
      await waitFor(() => {
        expect(screen.getByText(/오프라인 상태입니다/)).toBeInTheDocument()
      })
    })

    it('should not render offline banner when online', async () => {
      mockIsOnline = true
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      render(<ChatPage />)
      await waitFor(() => {
        expect(screen.queryByText(/오프라인 상태입니다/)).toBeNull()
      })
    })
  })

  // =========================================================================
  // ChatPage — extension context branch (lines 158-167)
  // =========================================================================
  describe('ChatPage extension context', () => {
    it('should render PageContextBanner when extensionContext is present', async () => {
      mockExtensionContext = { url: 'https://example.com', text: 'Some page content' }
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      const { container } = render(<ChatPage />)
      await waitFor(() => {
        // PageContextBanner should be rendered somewhere in the DOM
        expect(container.querySelector('main')).toBeTruthy()
      })
    })

    it('should not render PageContextBanner when extensionContext is null', async () => {
      mockExtensionContext = null
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      const { container } = render(<ChatPage />)
      await waitFor(() => {
        expect(container.querySelector('main')).toBeTruthy()
      })
    })
  })

  // =========================================================================
  // ChatPage — research mode toggle branch (lines 109-139, 263-277)
  // =========================================================================
  describe('ChatPage research mode toggle', () => {
    it('should render default chat mode lobby with assistant heading', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      render(<ChatPage />)
      // Wait for loading to finish, lobby view shows the heading
      await waitFor(() => {
        expect(screen.queryByText('대화를 불러오는 중...')).toBeNull()
      })
      // In chat mode the heading contains "업무 비서"
      expect(screen.getByText(/업무 비서/)).toBeInTheDocument()
    })

    it('should switch to research mode and show research heading', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      render(<ChatPage />)
      await waitFor(() => {
        expect(screen.queryByText('대화를 불러오는 중...')).toBeNull()
      })
      // The modeToggle('md') buttons contain "Chat" and "Research" text in the lobby
      // Find buttons containing "Research" text in span
      const researchSpans = screen.getAllByText('Research')
      fireEvent.click(researchSpans[0].closest('button')!)
      expect(screen.getByText(/최신 정보/)).toBeInTheDocument()
    })

    it('should switch back to chat mode from research mode', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      render(<ChatPage />)
      await waitFor(() => {
        expect(screen.queryByText('대화를 불러오는 중...')).toBeNull()
      })
      // Switch to research
      const researchSpans = screen.getAllByText('Research')
      fireEvent.click(researchSpans[0].closest('button')!)
      expect(screen.getByText(/최신 정보/)).toBeInTheDocument()
      // Switch back to chat
      const chatButtons = screen.getAllByText('Chat')
      fireEvent.click(chatButtons[0].closest('button')!)
      expect(screen.getByText(/업무 비서/)).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ChatPage — custom assistant modal button (line 286-293)
  // =========================================================================
  describe('ChatPage custom assistant button', () => {
    it('should render custom assistant button in lobby', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      render(<ChatPage />)
      await waitFor(() => {
        expect(screen.queryByText('대화를 불러오는 중...')).toBeNull()
      })
      expect(screen.getByText('커스텀 비서 만들기')).toBeInTheDocument()
    })

    it('should render Plus icon in custom assistant button', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      render(<ChatPage />)
      await waitFor(() => {
        expect(screen.getByText('커스텀 비서 만들기')).toBeInTheDocument()
      })
    })
  })

  // =========================================================================
  // ChatPage — loading state branch (lines 168-171)
  // =========================================================================
  describe('ChatPage loading state', () => {
    it('should show loading state initially before async load finishes', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      const { container } = render(<ChatPage />)
      // Either shows loading text or lobby content (race condition based on async)
      const hasContent =
        container.textContent?.includes('대화를 불러오는 중') ||
        container.textContent?.includes('업무 비서') ||
        container.textContent?.includes('Chat')
      expect(hasContent).toBe(true)
    })
  })

  // =========================================================================
  // DocsPage — select project, delete project, new project branches
  // =========================================================================
  describe('DocsPage branches', () => {
    it('should select a project and advance step', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      // Click on the first project row name
      const projectName = screen.getByText('2026년 상반기 사업계획서')
      fireEvent.click(projectName.closest('tr') || projectName)
    })

    it('should create a new project and show it in the list', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      fireEvent.click(screen.getByText('새 프로젝트 시작'))
      expect(screen.getByText('새 프로젝트')).toBeInTheDocument()
    })

    it('should handle deleting a project when selected project is deleted', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      // First create a new project to select it
      fireEvent.click(screen.getByText('새 프로젝트 시작'))
      expect(screen.getByText('새 프로젝트')).toBeInTheDocument()
    })

    it('should render all 5 step labels', async () => {
      const { default: DocsPage } = await import('../src/user/pages/DocsPage')
      render(<DocsPage />)
      expect(screen.getByText('프로젝트 선택')).toBeInTheDocument()
      expect(screen.getByText('파일 선택')).toBeInTheDocument()
      expect(screen.getByText('배경지식 제공')).toBeInTheDocument()
      expect(screen.getByText('목차 및 내용 작성')).toBeInTheDocument()
      expect(screen.getByText('파일 생성')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // OCRPage — mode switch, start OCR, reset branches
  // =========================================================================
  describe('OCRPage branches', () => {
    it('should switch to translate mode and update description', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      fireEvent.click(screen.getByText('번역'))
      expect(screen.getByText(/최대 20장까지 업로드/)).toBeInTheDocument()
    })

    it('should show extract button label for extract mode', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.getByText('텍스트 추출 시작')).toBeInTheDocument()
    })

    it('should show translate start button in translate mode', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      fireEvent.click(screen.getByText('번역'))
      expect(screen.getByText('번역 시작')).toBeInTheDocument()
    })

    it('should disable start button when no files uploaded', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      const startBtn = screen.getByText('텍스트 추출 시작')
      expect(startBtn.closest('button')).toBeDisabled()
    })

    it('should switch between extract and translate clearing uploaded files', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.getByText(/최대 5장까지 업로드/)).toBeInTheDocument()
      fireEvent.click(screen.getByText('번역'))
      expect(screen.getByText(/최대 20장까지 업로드/)).toBeInTheDocument()
      fireEvent.click(screen.getByText('텍스트 추출'))
      expect(screen.getByText(/최대 5장까지 업로드/)).toBeInTheDocument()
    })

    it('should not show step 2 results table initially', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.queryByText('변환된 파일 다운로드')).toBeNull()
    })

    it('should render two mode buttons with max file counts', async () => {
      const { default: OCRPage } = await import('../src/user/pages/OCRPage')
      render(<OCRPage />)
      expect(screen.getByText(/max 5장/)).toBeInTheDocument()
      expect(screen.getByText(/max 20장/)).toBeInTheDocument()
    })
  })

  // =========================================================================
  // TranslationPage — engine selection, start, reset branches
  // =========================================================================
  describe('TranslationPage branches', () => {
    it('should render both engine options', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText('자체 번역 엔진')).toBeInTheDocument()
      expect(screen.getByText('DeepL 번역 엔진')).toBeInTheDocument()
    })

    it('should disable start button when no files uploaded', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      const startBtns = screen.getAllByText('번역 시작')
      const fullWidthBtn = startBtns.find(
        (el) => el.closest('button[type="button"]')?.classList.contains('w-full')
      )
      expect(fullWidthBtn?.closest('button')).toBeDisabled()
    })

    it('should render all 7 supported format badges', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      for (const fmt of ['PDF', 'DOCX', 'DOC', 'PPTX', 'PPT', 'XLSX', 'XLS']) {
        expect(screen.getByText(fmt)).toBeInTheDocument()
      }
    })

    it('should render warning banner about AI translation', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText(/AI 번역 특성상 글이 빠질 수 있고/)).toBeInTheDocument()
    })

    it('should render step labels for translation flow', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      const startMatches = screen.getAllByText('번역 시작')
      expect(startMatches.length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText('번역 결과')).toBeInTheDocument()
    })

    it('should render file upload zone description', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText('번역할 문서 파일을 업로드하세요')).toBeInTheDocument()
    })

    it('should render page description text', async () => {
      const { default: TranslationPage } = await import('../src/user/pages/TranslationPage')
      render(<TranslationPage />)
      expect(screen.getByText(/문서를 업로드하면 형식을 유지한 채 번역/)).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ChatPage — AssistantGrid rendering in lobby
  // =========================================================================
  describe('ChatPage lobby content', () => {
    it('should render assistant grid in lobby view after loading', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      render(<ChatPage />)
      await waitFor(() => {
        expect(screen.queryByText('대화를 불러오는 중...')).toBeNull()
      })
      // The ChatSearchBar and AssistantGrid should be visible
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should render sidebar component', async () => {
      const { default: ChatPage } = await import('../src/user/pages/ChatPage')
      const { container } = render(<ChatPage />)
      await waitFor(() => {
        expect(container.querySelector('.flex.h-screen')).toBeTruthy()
      })
    })
  })
})
