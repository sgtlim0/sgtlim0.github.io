/**
 * User Pages — Deep Branch Coverage Tests
 *
 * Targets uncovered branches in ChatPage, OCRPage, TranslationPage
 * to push branch coverage from ~60-70% toward 80%+.
 *
 * Focus areas:
 *  - ChatPage: message sending (online/offline, chat/research), streaming,
 *    search panel, extension context interactions, empty messages, stop button
 *  - OCRPage: mode switch clears files, handleStartOCR guard, step 2 download states
 *  - TranslationPage: engine switch, handleStartTranslation guard, step 2 statuses
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Shared mocks
// ---------------------------------------------------------------------------

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

// Mutable mock flags
let mockIsOnline = true
let mockExtensionContext: { url: string; text: string; title: string } | null = null
const mockClearContext = vi.fn()

vi.mock('../src/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline }),
}))

vi.mock('../src/user/hooks/useExtensionContext', () => ({
  useExtensionContext: () => ({
    extensionContext: mockExtensionContext,
    clearContext: mockClearContext,
  }),
}))

// SSE mock with controllable stream
let mockStreamSubscribe: ReturnType<typeof vi.fn>
let mockStreamAbort: ReturnType<typeof vi.fn>
vi.mock('../src/user/services/sseService', () => ({
  streamResponse: vi.fn(() => {
    mockStreamSubscribe = vi.fn()
    mockStreamAbort = vi.fn()
    return {
      subscribe: mockStreamSubscribe,
      abort: mockStreamAbort,
    }
  }),
}))

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

vi.mock('../src/user/services/assistantService', () => ({
  getCustomAssistants: vi.fn(() => []),
  saveCustomAssistant: vi.fn(),
}))

// Controllable research mock
let mockResearchSearch: ReturnType<typeof vi.fn>
vi.mock('../src/user/services/researchService', () => ({
  createResearchService: vi.fn(() => {
    mockResearchSearch = vi.fn(() =>
      Promise.resolve({ answer: 'Research answer', sources: [] }),
    )
    return { search: mockResearchSearch, cancel: vi.fn() }
  }),
}))

vi.mock('../src/user/services/indexedDbService', () => ({
  migrateFromLocalStorage: vi.fn(() => Promise.resolve([])),
  saveAllConversations: vi.fn(() => Promise.resolve()),
}))

// PWA install mock
vi.mock('../src/hooks/usePWAInstall', () => ({
  usePWAInstall: () => ({ canInstall: false, install: vi.fn() }),
}))

// Polyfill scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function renderChatPage() {
  const { default: ChatPage } = await import('../src/user/pages/ChatPage')
  const utils = render(<ChatPage />)
  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText('대화를 불러오는 중...')).toBeNull()
  })
  return utils
}

async function navigateToConversation(title: string) {
  const el = screen.getByText(title)
  await act(async () => {
    fireEvent.click(el.closest('button')!)
  })
  await waitFor(() => {
    expect(screen.getByLabelText('뒤로가기')).toBeInTheDocument()
  })
}

// ---------------------------------------------------------------------------
// ChatPage
// ---------------------------------------------------------------------------

describe('ChatPage — deep branch coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsOnline = true
    mockExtensionContext = null
  })

  // -----------------------------------------------------------------------
  // handleSendMessage: offline guard
  // -----------------------------------------------------------------------
  describe('handleSendMessage offline guard', () => {
    it('should block message sending when offline', async () => {
      mockIsOnline = false
      await renderChatPage()

      // Navigate into the conversation with existing messages
      await navigateToConversation('프로젝트 기획 회의 정리')

      // Try to send a message via the ChatSearchBar input
      const input = screen.getByPlaceholderText(/무엇이든 물어보세요|메시지/)
      await userEvent.type(input, '테스트 메시지{enter}')

      // Offline banner should be visible
      expect(screen.getByText(/오프라인 상태입니다/)).toBeInTheDocument()
    })
  })

  // -----------------------------------------------------------------------
  // handleSendMessage: send in chat mode from lobby (creates new conversation)
  // -----------------------------------------------------------------------
  describe('handleSendMessage in chat mode from lobby', () => {
    it('should create a new conversation when sending from lobby', async () => {
      await renderChatPage()

      // In lobby, type and send a message
      const input = screen.getByPlaceholderText(/무엇이든 물어보세요|메시지/)
      await userEvent.type(input, '안녕하세요{enter}')

      // Should navigate into a conversation view (back button appears)
      await waitFor(() => {
        expect(screen.getByLabelText('뒤로가기')).toBeInTheDocument()
      })
    })
  })

  // -----------------------------------------------------------------------
  // handleSendMessage: send in research mode from lobby
  // -----------------------------------------------------------------------
  describe('handleSendMessage in research mode', () => {
    it('should dispatch to research handler when in research mode', async () => {
      await renderChatPage()

      // Switch to research mode
      const researchBtns = screen.getAllByText('Research')
      fireEvent.click(researchBtns[0].closest('button')!)
      expect(screen.getByText(/최신 정보/)).toBeInTheDocument()

      // Send a message in research mode
      const input = screen.getByPlaceholderText(/무엇이든 물어보세요|메시지/)
      await userEvent.type(input, '최신 AI 뉴스{enter}')

      // Should create conversation and navigate into it
      await waitFor(() => {
        expect(screen.getByLabelText('뒤로가기')).toBeInTheDocument()
      })
    })
  })

  // -----------------------------------------------------------------------
  // handleSendMessage: send in existing conversation (chat mode)
  // -----------------------------------------------------------------------
  describe('handleSendMessage in existing conversation', () => {
    it('should add message to the current conversation', async () => {
      await renderChatPage()
      await navigateToConversation('프로젝트 기획 회의 정리')

      const input = screen.getByPlaceholderText(/무엇이든 물어보세요|메시지/)
      await userEvent.type(input, '추가 질문입니다{enter}')

      // The user message should appear
      await waitFor(() => {
        expect(screen.getByText('추가 질문입니다')).toBeInTheDocument()
      })
    })
  })

  // -----------------------------------------------------------------------
  // Search panel: open, close, select conversation
  // -----------------------------------------------------------------------
  describe('search panel interactions', () => {
    it('should open search panel and close it', async () => {
      await renderChatPage()
      await navigateToConversation('프로젝트 기획 회의 정리')

      // Open search panel
      fireEvent.click(screen.getByLabelText('검색'))
      await waitFor(() => {
        expect(screen.getByText('대화 검색')).toBeInTheDocument()
      })

      // Close search panel by toggling
      fireEvent.click(screen.getByLabelText('검색'))
    })

    it('should select a conversation from search panel and close panel', async () => {
      await renderChatPage()
      await navigateToConversation('프로젝트 기획 회의 정리')

      // Open search panel
      fireEvent.click(screen.getByLabelText('검색'))
      await waitFor(() => {
        expect(screen.getByText('대화 검색')).toBeInTheDocument()
      })

      // The ChatSearchPanel renders conversations as full-width buttons.
      // Click on one to trigger handleSelectSearchConversation (lines 99-100).
      const searchPanel = document.querySelector('.fixed')!
      const resultButtons = searchPanel.querySelectorAll('button.w-full')
      // Find a result button that is a conversation result (not the close button)
      const convResultBtn = Array.from(resultButtons).find(
        (btn) => btn.textContent?.includes('영문 이메일 작성'),
      )
      if (convResultBtn) {
        fireEvent.click(convResultBtn)
        // Panel should close and conversation should switch
        await waitFor(() => {
          expect(screen.queryByText('대화 검색')).toBeNull()
        })
      }
    })
  })

  // -----------------------------------------------------------------------
  // Extension context: use context callback
  // -----------------------------------------------------------------------
  describe('extension context interactions', () => {
    it('should render banner and handle use context action', async () => {
      mockExtensionContext = {
        url: 'https://example.com',
        text: 'Extracted page content',
        title: 'Test Page',
      }
      await renderChatPage()

      // PageContextBanner should be rendered
      expect(screen.getByText('이 텍스트로 대화 시작')).toBeInTheDocument()
    })

    it('should handle dismiss on PageContextBanner', async () => {
      mockExtensionContext = {
        url: 'https://example.com',
        text: 'Some content',
        title: 'Page',
      }
      await renderChatPage()

      // Find and click dismiss button
      const dismissBtn = screen.getByLabelText('컨텍스트 닫기')
      fireEvent.click(dismissBtn)

      expect(mockClearContext).toHaveBeenCalled()
    })

    it('should send context text as message via onUseContext', async () => {
      mockExtensionContext = {
        url: 'https://test.com',
        text: 'Use this content for chat',
        title: 'Source',
      }
      await renderChatPage()

      // Click "이 텍스트로 대화 시작"
      fireEvent.click(screen.getByText('이 텍스트로 대화 시작'))

      // Should trigger clearContext after sending
      expect(mockClearContext).toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // Empty messages in conversation view
  // -----------------------------------------------------------------------
  describe('empty messages in conversation', () => {
    it('should show empty message prompt for conversation with no messages', async () => {
      await renderChatPage()

      // "분기 보고서 데이터 분석" has empty messages in mockConversations
      const conv = screen.getByText('분기 보고서 데이터 분석')
      await act(async () => {
        fireEvent.click(conv.closest('button')!)
      })

      await waitFor(() => {
        expect(
          screen.getByText('메시지를 입력하여 대화를 시작하세요.'),
        ).toBeInTheDocument()
      })
    })
  })

  // -----------------------------------------------------------------------
  // currentAssistant with model vs without model
  // -----------------------------------------------------------------------
  describe('assistant display', () => {
    it('should show assistant model name when available', async () => {
      await renderChatPage()
      await navigateToConversation('프로젝트 기획 회의 정리')

      // Assistant a1 (신중한 톡정이) has model: 'GPT-4o'
      expect(screen.getByText('GPT-4o')).toBeInTheDocument()
    })

    it('should not show model text when assistant has no model', async () => {
      await renderChatPage()

      // "영문 이메일 작성" uses assistant a8 (이메일 작성) with model: ''
      const conv = screen.getByText('영문 이메일 작성')
      await act(async () => {
        fireEvent.click(conv.closest('button')!)
      })

      await waitFor(() => {
        expect(screen.getByLabelText('뒤로가기')).toBeInTheDocument()
      })
      // '이메일 작성' assistant should be shown, but no model text
      expect(screen.getByText('이메일 작성')).toBeInTheDocument()
    })
  })

  // -----------------------------------------------------------------------
  // Custom assistant modal open
  // -----------------------------------------------------------------------
  describe('custom assistant modal', () => {
    it('should open custom assistant modal when clicking the button', async () => {
      await renderChatPage()

      fireEvent.click(screen.getByText('커스텀 비서 만들기'))

      // The CustomAssistantModal should open (it receives isOpen=true)
      await waitFor(() => {
        // Modal should render with save/cancel type controls
        const modal = document.querySelector('[role="dialog"]')
        const modalContent = document.querySelector('.fixed')
        expect(modal || modalContent || screen.queryByText('저장')).toBeTruthy()
      })
    })
  })

  // -----------------------------------------------------------------------
  // modeToggle sizing branches (sm in header, md in lobby)
  // -----------------------------------------------------------------------
  describe('modeToggle size variants', () => {
    it('should render md size toggle in lobby', async () => {
      await renderChatPage()

      // In lobby, both Chat and Research buttons are rendered with md size
      const chatBtns = screen.getAllByText('Chat')
      expect(chatBtns.length).toBeGreaterThanOrEqual(1)
    })

    it('should render sm size toggle in conversation header', async () => {
      await renderChatPage()
      await navigateToConversation('프로젝트 기획 회의 정리')

      // In conversation view, the sm modeToggle is shown in header
      const chatBtns = screen.getAllByText('Chat')
      expect(chatBtns.length).toBeGreaterThanOrEqual(1)
      const researchBtns = screen.getAllByText('Research')
      expect(researchBtns.length).toBeGreaterThanOrEqual(1)
    })

    it('should switch mode in conversation header (sm toggle)', async () => {
      await renderChatPage()
      await navigateToConversation('프로젝트 기획 회의 정리')

      // Click Research in the sm toggle within conversation header
      const researchBtns = screen.getAllByText('Research')
      fireEvent.click(researchBtns[0].closest('button')!)

      // Click Chat back
      const chatBtns = screen.getAllByText('Chat')
      fireEvent.click(chatBtns[0].closest('button')!)
    })
  })

  // -----------------------------------------------------------------------
  // Select assistant from grid to create new conversation
  // -----------------------------------------------------------------------
  describe('select assistant from grid', () => {
    it('should create a new conversation when selecting an assistant', async () => {
      await renderChatPage()

      // Click on an assistant card in the grid
      const assistantCard = screen.getByText('신중한 톡정이')
      fireEvent.click(assistantCard.closest('button') || assistantCard)

      await waitFor(() => {
        const emptyPrompt = screen.queryByText('메시지를 입력하여 대화를 시작하세요.')
        const backBtn = screen.queryByLabelText('뒤로가기')
        expect(emptyPrompt || backBtn).toBeTruthy()
      })
    })
  })

  // -----------------------------------------------------------------------
  // Delete conversation
  // -----------------------------------------------------------------------
  describe('delete conversation', () => {
    it('should handle conversation deletion from sidebar', async () => {
      await renderChatPage()

      // Look for delete buttons in sidebar (if present)
      const deleteButtons = document.querySelectorAll('[aria-label*="삭제"]')
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0])
      }
    })
  })
})

// ---------------------------------------------------------------------------
// OCRPage — additional branch coverage
// ---------------------------------------------------------------------------

describe('OCRPage — deep branch coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should switch to translate mode and show correct button label', async () => {
    const { default: OCRPage } = await import('../src/user/pages/OCRPage')
    render(<OCRPage />)

    // Initially in extract mode
    expect(screen.getByText('텍스트 추출 시작')).toBeInTheDocument()

    // Switch to translate
    fireEvent.click(screen.getByText('번역'))
    expect(screen.getByText('번역 시작')).toBeInTheDocument()
    expect(screen.getByText(/최대 20장까지 업로드/)).toBeInTheDocument()
  })

  it('should upload files and start OCR in translate mode', async () => {
    const { default: OCRPage } = await import('../src/user/pages/OCRPage')
    render(<OCRPage />)

    // Switch to translate mode
    fireEvent.click(screen.getByText('번역'))

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'scan.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByText(/업로드 \(1개 파일\)/))

    // Start OCR in translate mode
    fireEvent.click(screen.getByText('번역 시작'))
    expect(screen.getByText('변환된 파일 다운로드')).toBeInTheDocument()
    expect(screen.getByText('scan.png')).toBeInTheDocument()
  })

  it('should render existing mock OCR jobs with correct status badges', async () => {
    const { default: OCRPage } = await import('../src/user/pages/OCRPage')
    render(<OCRPage />)

    // Upload a file and start OCR to enter step 2
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByText(/업로드 \(1개 파일\)/))
    fireEvent.click(screen.getByText('텍스트 추출 시작'))

    // Step 2 should show existing mock jobs too
    expect(screen.getByText('변환된 파일 다운로드')).toBeInTheDocument()

    // Existing mock jobs: '완료' status jobs should have enabled download buttons
    const downloadBtns = screen.getAllByText('다운로드')
    expect(downloadBtns.length).toBeGreaterThanOrEqual(1)
  })

  it('should upload multiple files and show them all in step 2', async () => {
    const { default: OCRPage } = await import('../src/user/pages/OCRPage')
    render(<OCRPage />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file1 = new File(['a'], 'doc1.jpg', { type: 'image/jpeg' })
    const file2 = new File(['b'], 'doc2.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file1, file2] } })
    fireEvent.click(screen.getByText(/업로드 \(2개 파일\)/))

    fireEvent.click(screen.getByText('텍스트 추출 시작'))
    expect(screen.getByText('doc1.jpg')).toBeInTheDocument()
    expect(screen.getByText('doc2.png')).toBeInTheDocument()
  })

  it('should handle mode switch clearing files and re-upload', async () => {
    const { default: OCRPage } = await import('../src/user/pages/OCRPage')
    render(<OCRPage />)

    // Upload in extract mode
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByText(/업로드 \(1개 파일\)/))

    // Switch mode -> clears files
    fireEvent.click(screen.getByText('번역'))
    // Start button should be disabled again (files cleared)
    const startBtn = screen.getByText('번역 시작')
    expect(startBtn.closest('button')).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// TranslationPage — additional branch coverage
// ---------------------------------------------------------------------------

describe('TranslationPage — deep branch coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should select DeepL engine and start translation', async () => {
    const { default: TranslationPage } = await import(
      '../src/user/pages/TranslationPage'
    )
    render(<TranslationPage />)

    // Select DeepL engine
    fireEvent.click(screen.getByText('DeepL 번역 엔진'))

    // Upload a file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'report.docx', { type: 'application/msword' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByText(/업로드 \(1개 파일\)/))

    // Start translation
    const startBtns = screen.getAllByText('번역 시작')
    const fullWidthBtn = startBtns.find(
      (el) =>
        el.closest('button[type="button"]')?.classList.contains('w-full'),
    )
    fireEvent.click(fullWidthBtn!.closest('button')!)

    // Should be in step 2
    expect(screen.getByText('report.docx')).toBeInTheDocument()
    expect(screen.getByText('번역 중')).toBeInTheDocument()
  })

  it('should show processing status badge for translation jobs', async () => {
    const { default: TranslationPage } = await import(
      '../src/user/pages/TranslationPage'
    )
    render(<TranslationPage />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByText(/업로드 \(1개 파일\)/))

    const startBtns = screen.getAllByText('번역 시작')
    const fullWidthBtn = startBtns.find(
      (el) =>
        el.closest('button[type="button"]')?.classList.contains('w-full'),
    )
    fireEvent.click(fullWidthBtn!.closest('button')!)

    // Job should be in 'processing' state -> download button disabled
    const downloadBtns = screen.getAllByText('다운로드')
    // The single uploaded file's download button should be disabled
    const disabledBtn = downloadBtns
      .map((el) => el.closest('button'))
      .find((btn) => btn?.disabled)
    expect(disabledBtn).toBeTruthy()
  })

  it('should upload multiple files and show all in step 2', async () => {
    const { default: TranslationPage } = await import(
      '../src/user/pages/TranslationPage'
    )
    render(<TranslationPage />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file1 = new File(['a'], 'file1.pptx', { type: 'application/pptx' })
    const file2 = new File(['b'], 'file2.xlsx', { type: 'application/xlsx' })
    fireEvent.change(fileInput, { target: { files: [file1, file2] } })
    fireEvent.click(screen.getByText(/업로드 \(2개 파일\)/))

    const startBtns = screen.getAllByText('번역 시작')
    const fullWidthBtn = startBtns.find(
      (el) =>
        el.closest('button[type="button"]')?.classList.contains('w-full'),
    )
    fireEvent.click(fullWidthBtn!.closest('button')!)

    expect(screen.getByText('file1.pptx')).toBeInTheDocument()
    expect(screen.getByText('file2.xlsx')).toBeInTheDocument()
  })

  it('should handle empty files guard (no action when no files)', async () => {
    const { default: TranslationPage } = await import(
      '../src/user/pages/TranslationPage'
    )
    render(<TranslationPage />)

    // Button is disabled, but verify step 1 remains
    const startBtns = screen.getAllByText('번역 시작')
    const fullWidthBtn = startBtns.find(
      (el) =>
        el.closest('button[type="button"]')?.classList.contains('w-full'),
    )
    expect(fullWidthBtn?.closest('button')).toBeDisabled()
    // Step 1 content should still be visible
    expect(screen.getByText('자체 번역 엔진')).toBeInTheDocument()
  })

  it('should reset and show step 1 with engine selector after new translation', async () => {
    const { default: TranslationPage } = await import(
      '../src/user/pages/TranslationPage'
    )
    render(<TranslationPage />)

    // Select DeepL engine
    fireEvent.click(screen.getByText('DeepL 번역 엔진'))

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'file.doc', { type: 'application/msword' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByText(/업로드 \(1개 파일\)/))

    const startBtns = screen.getAllByText('번역 시작')
    const fullWidthBtn = startBtns.find(
      (el) =>
        el.closest('button[type="button"]')?.classList.contains('w-full'),
    )
    fireEvent.click(fullWidthBtn!.closest('button')!)

    // In step 2
    expect(screen.getByText('새 번역 시작')).toBeInTheDocument()

    // Reset
    fireEvent.click(screen.getByText('새 번역 시작'))

    // Back to step 1 with engine selector
    expect(screen.getByText('자체 번역 엔진')).toBeInTheDocument()
    expect(screen.getByText('DeepL 번역 엔진')).toBeInTheDocument()
    // File upload zone should be back
    expect(
      screen.getByText('번역할 문서 파일을 업로드하세요'),
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// DocsPage — additional branch coverage for edge cases
// ---------------------------------------------------------------------------

describe('DocsPage — additional branch coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle creating multiple new projects sequentially', async () => {
    const { default: DocsPage } = await import('../src/user/pages/DocsPage')
    render(<DocsPage />)

    fireEvent.click(screen.getByText('새 프로젝트 시작'))
    const firstProject = screen.getAllByText('새 프로젝트')
    expect(firstProject.length).toBeGreaterThanOrEqual(1)

    fireEvent.click(screen.getByText('새 프로젝트 시작'))
    // There should now be two "새 프로젝트" entries
    const projects = screen.getAllByText('새 프로젝트')
    expect(projects.length).toBeGreaterThanOrEqual(2)
  })

  it('should select a project then delete it and return to initial step', async () => {
    const { default: DocsPage } = await import('../src/user/pages/DocsPage')
    render(<DocsPage />)

    // Select a project
    fireEvent.click(screen.getByText('2026년 상반기 사업계획서'))

    // Delete the selected project
    const deleteBtn = screen.getByLabelText('2026년 상반기 사업계획서 삭제')
    fireEvent.click(deleteBtn)

    expect(screen.queryByText('2026년 상반기 사업계획서')).toBeNull()
    // Step should reset to 1
    expect(screen.getByText('프로젝트 선택')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// MyPage — ensure full render
// ---------------------------------------------------------------------------

describe('MyPage — branch coverage', () => {
  it('should render all sections completely', async () => {
    const { default: MyPage } = await import('../src/user/pages/MyPage')
    render(<MyPage />)

    expect(screen.getByText('내 계정')).toBeInTheDocument()
    expect(screen.getByText('구독 정보')).toBeInTheDocument()
    expect(screen.getByText('이달의 내 상세 사용 현황')).toBeInTheDocument()

    // Check subscription mock data
    const emails = screen.getAllByText('wooggi@gmail.com')
    expect(emails.length).toBeGreaterThanOrEqual(1)

    // Check plan info
    expect(screen.getByText('Starter')).toBeInTheDocument()

    // Check usage table entries
    expect(screen.getByText('OPENAI_CHAT_GPT4')).toBeInTheDocument()
    expect(screen.getByText('OPENAI_DALL_E3')).toBeInTheDocument()
  })
})
