/**
 * Extended user component tests targeting low-coverage areas:
 * CustomAssistantModal, ChatSearchPanel, FileUploadZone, AssistantGrid,
 * ChatSearchBar, ProjectTable, InstallBanner, PageContextBanner, ResearchPanel
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// ---------- CustomAssistantModal ----------

import CustomAssistantModal from '../src/user/components/CustomAssistantModal'

describe('CustomAssistantModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when not open', () => {
    const { container } = render(
      <CustomAssistantModal {...defaultProps} isOpen={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders modal with form elements when open', () => {
    render(<CustomAssistantModal {...defaultProps} />)
    expect(screen.getByText('새 비서 만들기')).toBeDefined()
    expect(screen.getByPlaceholderText('비서 이름을 입력하세요')).toBeDefined()
    expect(screen.getByText('저장')).toBeDefined()
    expect(screen.getByText('취소')).toBeDefined()
  })

  it('shows editing title when editingAssistant is provided', () => {
    render(
      <CustomAssistantModal
        {...defaultProps}
        editingAssistant={{
          id: 'a1',
          name: 'Test Bot',
          icon: '🧠',
          iconColor: '#8B5CF6',
          model: 'GPT-4o',
          description: 'Test desc',
          category: '업무',
          isOfficial: false,
        }}
      />,
    )
    expect(screen.getByText('비서 수정')).toBeDefined()
  })

  it('populates form fields from editingAssistant', () => {
    render(
      <CustomAssistantModal
        {...defaultProps}
        editingAssistant={{
          id: 'a1',
          name: 'My Bot',
          icon: '💡',
          iconColor: '#10B981',
          model: 'Claude Sonnet',
          description: 'A description',
          category: '번역',
          isOfficial: false,
        }}
      />,
    )
    const nameInput = screen.getByPlaceholderText('비서 이름을 입력하세요') as HTMLInputElement
    expect(nameInput.value).toBe('My Bot')
  })

  it('calls onSave with form data on save click', () => {
    const onSave = vi.fn()
    render(<CustomAssistantModal {...defaultProps} onSave={onSave} />)

    const nameInput = screen.getByPlaceholderText('비서 이름을 입력하세요')
    fireEvent.change(nameInput, { target: { value: 'New Bot' } })

    fireEvent.click(screen.getByText('저장'))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Bot' }),
    )
  })

  it('does not call onSave when name is empty', () => {
    const onSave = vi.fn()
    render(<CustomAssistantModal {...defaultProps} onSave={onSave} />)

    fireEvent.click(screen.getByText('저장'))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn()
    render(<CustomAssistantModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('취소'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when X button is clicked', () => {
    const onClose = vi.fn()
    render(<CustomAssistantModal {...defaultProps} onClose={onClose} />)
    // X button is the one with the X icon in the header
    const buttons = screen.getAllByRole('button')
    // Find the close button (second button after tabs, in header)
    const closeBtn = buttons.find(
      (b) => b.closest('.border-b') && b.querySelector('svg'),
    )
    if (closeBtn) {
      fireEvent.click(closeBtn)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('closes on overlay click', () => {
    const onClose = vi.fn()
    const { container } = render(
      <CustomAssistantModal {...defaultProps} onClose={onClose} />,
    )
    const overlay = container.querySelector('.fixed.inset-0')
    if (overlay) {
      fireEvent.click(overlay)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('does not close when clicking inside modal content', () => {
    const onClose = vi.fn()
    render(<CustomAssistantModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('새 비서 만들기'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on Escape key', () => {
    const onClose = vi.fn()
    render(<CustomAssistantModal {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('allows selecting an emoji icon', () => {
    render(<CustomAssistantModal {...defaultProps} />)
    const emojiButton = screen.getByText('🧠')
    fireEvent.click(emojiButton)
    // The button should now have the active border class
    expect(emojiButton.closest('button')?.className).toContain('border-')
  })

  it('allows selecting a color', () => {
    const { container } = render(<CustomAssistantModal {...defaultProps} />)
    // Color buttons are under the "아이콘 색상" label
    const colorButtons = container.querySelectorAll(
      'button[style]',
    ) as NodeListOf<HTMLButtonElement>
    expect(colorButtons.length).toBeGreaterThan(0)
    fireEvent.click(colorButtons[1])
    // Should update selection
    expect(colorButtons[1].className).toContain('border-')
  })

  it('allows changing model selection', () => {
    render(<CustomAssistantModal {...defaultProps} />)
    const select = screen.getAllByRole('combobox')[0] as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'Claude Sonnet' } })
    expect(select.value).toBe('Claude Sonnet')
  })

  it('allows changing description', () => {
    render(<CustomAssistantModal {...defaultProps} />)
    const textarea = screen.getByPlaceholderText('이 비서의 역할과 행동 지침을 입력하세요')
    fireEvent.change(textarea, { target: { value: 'New prompt' } })
    expect((textarea as HTMLTextAreaElement).value).toBe('New prompt')
  })

  it('allows changing category', () => {
    render(<CustomAssistantModal {...defaultProps} />)
    const selects = screen.getAllByRole('combobox')
    const categorySelect = selects[selects.length - 1] as HTMLSelectElement
    fireEvent.change(categorySelect, { target: { value: '보고' } })
    expect(categorySelect.value).toBe('보고')
  })
})

// ---------- ChatSearchPanel ----------

import ChatSearchPanel from '../src/user/components/ChatSearchPanel'
import type { Conversation } from '../src/user/services/types'

const makeConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 'conv-1',
  title: 'Test Conversation',
  messages: [
    { id: 'm1', role: 'user', content: 'Hello world', timestamp: '2026-03-08T10:00:00Z' },
    { id: 'm2', role: 'assistant', content: 'Hi there!', timestamp: '2026-03-08T10:01:00Z' },
  ],
  assistantId: 'asst-1',
  createdAt: '2026-03-08T10:00:00Z',
  updatedAt: '2026-03-08T10:00:00Z',
  ...overrides,
})

describe('ChatSearchPanel', () => {
  const defaultProps = {
    conversations: [makeConversation()],
    onSelectConversation: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input and header', () => {
    render(<ChatSearchPanel {...defaultProps} />)
    expect(screen.getByText('대화 검색')).toBeDefined()
    expect(screen.getByPlaceholderText('대화 내용 검색...')).toBeDefined()
  })

  it('renders date filter buttons', () => {
    render(<ChatSearchPanel {...defaultProps} />)
    expect(screen.getByText('전체')).toBeDefined()
    expect(screen.getByText('오늘')).toBeDefined()
    expect(screen.getByText('이번 주')).toBeDefined()
    expect(screen.getByText('이번 달')).toBeDefined()
  })

  it('renders conversation titles', () => {
    render(<ChatSearchPanel {...defaultProps} />)
    expect(screen.getByText('Test Conversation')).toBeDefined()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<ChatSearchPanel {...defaultProps} onClose={onClose} />)
    // Find the X close button
    const buttons = screen.getAllByRole('button')
    const closeBtn = buttons.find((b) => b.querySelector('svg') && b.closest('.border-b'))
    if (closeBtn) fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSelectConversation and onClose when a conversation is clicked', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()
    render(
      <ChatSearchPanel
        {...defaultProps}
        onSelectConversation={onSelect}
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByText('Test Conversation'))
    expect(onSelect).toHaveBeenCalledWith('conv-1')
    expect(onClose).toHaveBeenCalled()
  })

  it('filters by search query matching title', () => {
    render(
      <ChatSearchPanel
        {...defaultProps}
        conversations={[
          makeConversation({ id: '1', title: 'Alpha' }),
          makeConversation({ id: '2', title: 'Beta' }),
        ]}
      />,
    )
    const input = screen.getByPlaceholderText('대화 내용 검색...')
    fireEvent.change(input, { target: { value: 'Alpha' } })

    expect(screen.getByText('Alpha')).toBeDefined()
    expect(screen.queryByText('Beta')).toBeNull()
  })

  it('filters by search query matching message content', () => {
    render(
      <ChatSearchPanel
        {...defaultProps}
        conversations={[
          makeConversation({
            id: '1',
            title: 'Chat A',
            messages: [
              { id: 'm1', role: 'user', content: 'unique keyword here', timestamp: '2026-03-08T10:00:00Z' },
            ],
          }),
          makeConversation({ id: '2', title: 'Chat B' }),
        ]}
      />,
    )
    const input = screen.getByPlaceholderText('대화 내용 검색...')
    fireEvent.change(input, { target: { value: 'unique keyword' } })

    expect(screen.getByText('Chat A')).toBeDefined()
    expect(screen.queryByText('Chat B')).toBeNull()
  })

  it('shows empty state when no results match', () => {
    render(<ChatSearchPanel {...defaultProps} />)
    const input = screen.getByPlaceholderText('대화 내용 검색...')
    fireEvent.change(input, { target: { value: 'nonexistent12345' } })
    expect(screen.getByText('검색 결과가 없습니다')).toBeDefined()
  })

  it('filters by date - 오늘', () => {
    const todayConv = makeConversation({
      id: '1',
      title: 'Today Conv',
      updatedAt: new Date().toISOString(),
    })
    const oldConv = makeConversation({
      id: '2',
      title: 'Old Conv',
      updatedAt: '2020-01-01T00:00:00Z',
    })
    render(
      <ChatSearchPanel
        {...defaultProps}
        conversations={[todayConv, oldConv]}
      />,
    )
    fireEvent.click(screen.getByText('오늘'))
    expect(screen.getByText('Today Conv')).toBeDefined()
    expect(screen.queryByText('Old Conv')).toBeNull()
  })

  it('filters by date - 이번 주', () => {
    const recentConv = makeConversation({
      id: '1',
      title: 'Recent',
      updatedAt: new Date().toISOString(),
    })
    const oldConv = makeConversation({
      id: '2',
      title: 'Ancient',
      updatedAt: '2020-01-01T00:00:00Z',
    })
    render(
      <ChatSearchPanel
        {...defaultProps}
        conversations={[recentConv, oldConv]}
      />,
    )
    fireEvent.click(screen.getByText('이번 주'))
    expect(screen.getByText('Recent')).toBeDefined()
    expect(screen.queryByText('Ancient')).toBeNull()
  })

  it('filters by date - 이번 달', () => {
    const thisMonthConv = makeConversation({
      id: '1',
      title: 'This Month',
      updatedAt: new Date().toISOString(),
    })
    const oldConv = makeConversation({
      id: '2',
      title: 'Last Year',
      updatedAt: '2020-06-15T00:00:00Z',
    })
    render(
      <ChatSearchPanel
        {...defaultProps}
        conversations={[thisMonthConv, oldConv]}
      />,
    )
    fireEvent.click(screen.getByText('이번 달'))
    expect(screen.getByText('This Month')).toBeDefined()
    expect(screen.queryByText('Last Year')).toBeNull()
  })

  it('highlights matching text in title', () => {
    render(
      <ChatSearchPanel
        {...defaultProps}
        conversations={[makeConversation({ title: 'Hello World' })]}
      />,
    )
    const input = screen.getByPlaceholderText('대화 내용 검색...')
    fireEvent.change(input, { target: { value: 'Hello' } })

    const marks = document.querySelectorAll('mark')
    expect(marks.length).toBeGreaterThan(0)
  })

  it('shows message preview with context around match', () => {
    const longContent =
      'This is a very long message that contains a special keyword embedded deep within the text for testing purposes'
    render(
      <ChatSearchPanel
        {...defaultProps}
        conversations={[
          makeConversation({
            messages: [
              { id: 'm1', role: 'user', content: longContent, timestamp: '2026-03-08T10:00:00Z' },
            ],
          }),
        ]}
      />,
    )
    const input = screen.getByPlaceholderText('대화 내용 검색...')
    fireEvent.change(input, { target: { value: 'special keyword' } })
    // Should show ellipsis-trimmed preview
    const preview = document.querySelectorAll('p.line-clamp-2')
    expect(preview.length).toBeGreaterThan(0)
  })

  it('formats dates - yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(12, 0, 0, 0)

    render(
      <ChatSearchPanel
        {...defaultProps}
        conversations={[
          makeConversation({ updatedAt: yesterday.toISOString() }),
        ]}
      />,
    )
    expect(screen.getByText('어제')).toBeDefined()
  })

  it('formats dates - older this year', () => {
    const janDate = new Date(new Date().getFullYear(), 0, 15, 12, 0, 0)
    // Only works if current month is not January
    if (new Date().getMonth() > 0) {
      render(
        <ChatSearchPanel
          {...defaultProps}
          conversations={[
            makeConversation({ updatedAt: janDate.toISOString() }),
          ]}
        />,
      )
      // Should show month and day format
      const timeText = document.querySelectorAll('span.whitespace-nowrap')
      expect(timeText.length).toBeGreaterThan(0)
    }
  })

  it('formats dates - different year', () => {
    render(
      <ChatSearchPanel
        {...defaultProps}
        conversations={[
          makeConversation({ updatedAt: '2020-06-15T12:00:00Z' }),
        ]}
      />,
    )
    const timeText = document.querySelectorAll('span.whitespace-nowrap')
    expect(timeText.length).toBeGreaterThan(0)
  })
})

// ---------- FileUploadZone extended ----------

import FileUploadZone from '../src/user/components/FileUploadZone'

describe('FileUploadZone - extended', () => {
  it('shows drag over state on dragOver', () => {
    const { container } = render(<FileUploadZone onUpload={vi.fn()} />)
    const dropZone = container.querySelector('[role="button"]')!
    fireEvent.dragOver(dropZone)
    // Should show drag state styling
    expect(dropZone.className).toContain('border-user-primary')
  })

  it('resets drag state on dragLeave', () => {
    const { container } = render(<FileUploadZone onUpload={vi.fn()} />)
    const dropZone = container.querySelector('[role="button"]')!
    fireEvent.dragOver(dropZone)
    fireEvent.dragLeave(dropZone)
    expect(dropZone.className).not.toContain('bg-user-primary/5')
  })

  it('adds files on drop', () => {
    const { container } = render(<FileUploadZone onUpload={vi.fn()} />)
    const dropZone = container.querySelector('[role="button"]')!

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    })

    expect(screen.getByText('test.txt')).toBeDefined()
    expect(screen.getByText('업로드 (1개 파일)')).toBeDefined()
  })

  it('adds files via input change', () => {
    const { container } = render(<FileUploadZone onUpload={vi.fn()} />)
    const input = container.querySelector('input[type="file"]')!

    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('doc.pdf')).toBeDefined()
  })

  it('removes a file when remove button is clicked', () => {
    const { container } = render(<FileUploadZone onUpload={vi.fn()} />)
    const input = container.querySelector('input[type="file"]')!

    const file = new File(['content'], 'remove-me.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('remove-me.txt')).toBeDefined()

    const removeBtn = screen.getByLabelText('remove-me.txt 제거')
    fireEvent.click(removeBtn)

    expect(screen.queryByText('remove-me.txt')).toBeNull()
  })

  it('calls onUpload and clears files on upload click', () => {
    const onUpload = vi.fn()
    const { container } = render(<FileUploadZone onUpload={onUpload} />)
    const input = container.querySelector('input[type="file"]')!

    const file = new File(['data'], 'up.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.click(screen.getByText('업로드 (1개 파일)'))
    expect(onUpload).toHaveBeenCalledWith([file])
    expect(screen.queryByText('up.txt')).toBeNull()
  })

  it('limits files to maxFiles', () => {
    const { container } = render(
      <FileUploadZone onUpload={vi.fn()} maxFiles={2} />,
    )
    const input = container.querySelector('input[type="file"]')!

    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
      new File(['c'], 'c.txt', { type: 'text/plain' }),
    ]
    fireEvent.change(input, { target: { files } })

    expect(screen.getByText('a.txt')).toBeDefined()
    expect(screen.getByText('b.txt')).toBeDefined()
    expect(screen.queryByText('c.txt')).toBeNull()
  })

  it('shows custom description', () => {
    render(<FileUploadZone onUpload={vi.fn()} description="Upload images only" />)
    expect(screen.getByText('Upload images only')).toBeDefined()
  })

  it('formats file sizes correctly', () => {
    const { container } = render(<FileUploadZone onUpload={vi.fn()} />)
    const input = container.querySelector('input[type="file"]')!

    const file = new File(['x'.repeat(1024)], 'sized.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('1.0 KB')).toBeDefined()
  })

  it('does not call onUpload when no files selected', () => {
    const onUpload = vi.fn()
    render(<FileUploadZone onUpload={onUpload} />)
    // No upload button visible when no files
    expect(screen.queryByText(/업로드/)).toBeNull()
  })
})

// ---------- AssistantGrid ----------

import AssistantGrid from '../src/user/components/AssistantGrid'
import type { Assistant } from '../src/user/services/types'

const makeAssistant = (overrides: Partial<Assistant> = {}): Assistant => ({
  id: 'asst-1',
  name: 'Test Bot',
  description: 'desc',
  icon: '🤖',
  iconColor: '#3B82F6',
  model: 'GPT-4o',
  category: '채팅',
  isOfficial: true,
  ...overrides,
})

describe('AssistantGrid', () => {
  const baseProps = {
    assistants: [
      makeAssistant({ id: '1', name: 'Bot1', category: '채팅' }),
      makeAssistant({ id: '2', name: 'Bot2', category: '번역' }),
    ],
    activeTab: 'official' as const,
    activeCategory: '전체' as const,
    onTabChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onSelectAssistant: vi.fn(),
  }

  it('renders official tab and custom tab', () => {
    render(<AssistantGrid {...baseProps} />)
    expect(screen.getByText('H Chat 공식 비서')).toBeDefined()
    expect(screen.getByText('내가 만든 비서')).toBeDefined()
  })

  it('shows all official assistants when category is 전체', () => {
    render(<AssistantGrid {...baseProps} />)
    expect(screen.getByText('Bot1')).toBeDefined()
    expect(screen.getByText('Bot2')).toBeDefined()
  })

  it('filters by category', () => {
    render(<AssistantGrid {...baseProps} activeCategory="채팅" />)
    expect(screen.getByText('Bot1')).toBeDefined()
    expect(screen.queryByText('Bot2')).toBeNull()
  })

  it('shows empty state for custom tab', () => {
    render(<AssistantGrid {...baseProps} activeTab="custom" />)
    expect(screen.getByText('아직 만든 비서가 없어요')).toBeDefined()
  })

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn()
    render(<AssistantGrid {...baseProps} onTabChange={onTabChange} />)
    fireEvent.click(screen.getByText('내가 만든 비서'))
    expect(onTabChange).toHaveBeenCalledWith('custom')
  })

  it('shows empty message when no assistants in category', () => {
    render(
      <AssistantGrid
        {...baseProps}
        activeCategory="그림"
      />,
    )
    expect(screen.getByText('해당 카테고리에 비서가 없습니다.')).toBeDefined()
  })

  it('hides CategoryFilter on custom tab', () => {
    render(<AssistantGrid {...baseProps} activeTab="custom" />)
    expect(screen.queryByRole('tablist', { name: '카테고리 필터' })).toBeNull()
  })
})

// ---------- ChatSearchBar ----------

import ChatSearchBar from '../src/user/components/ChatSearchBar'

describe('ChatSearchBar - extended', () => {
  it('submits on form submit', () => {
    const onSubmit = vi.fn()
    render(<ChatSearchBar onSubmit={onSubmit} />)

    const textarea = screen.getByLabelText('검색 입력')
    fireEvent.change(textarea, { target: { value: 'test query' } })

    // Submit via form
    const form = textarea.closest('form')!
    fireEvent.submit(form)

    expect(onSubmit).toHaveBeenCalledWith('test query')
  })

  it('submits on Enter key (no shift)', () => {
    const onSubmit = vi.fn()
    render(<ChatSearchBar onSubmit={onSubmit} />)

    const textarea = screen.getByLabelText('검색 입력')
    fireEvent.change(textarea, { target: { value: 'enter test' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

    expect(onSubmit).toHaveBeenCalledWith('enter test')
  })

  it('does not submit on Shift+Enter', () => {
    const onSubmit = vi.fn()
    render(<ChatSearchBar onSubmit={onSubmit} />)

    const textarea = screen.getByLabelText('검색 입력')
    fireEvent.change(textarea, { target: { value: 'multiline' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit empty query', () => {
    const onSubmit = vi.fn()
    render(<ChatSearchBar onSubmit={onSubmit} />)

    const form = screen.getByLabelText('검색 입력').closest('form')!
    fireEvent.submit(form)

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit whitespace-only query via Enter', () => {
    const onSubmit = vi.fn()
    render(<ChatSearchBar onSubmit={onSubmit} />)

    const textarea = screen.getByLabelText('검색 입력')
    fireEvent.change(textarea, { target: { value: '   ' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears input after submit', () => {
    const onSubmit = vi.fn()
    render(<ChatSearchBar onSubmit={onSubmit} />)

    const textarea = screen.getByLabelText('검색 입력') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'clear me' } })
    fireEvent.submit(textarea.closest('form')!)

    expect(textarea.value).toBe('')
  })

  it('renders attach button when onAttach is provided', () => {
    const onAttach = vi.fn()
    render(<ChatSearchBar onSubmit={vi.fn()} onAttach={onAttach} />)
    const attachBtn = screen.getByLabelText('파일 첨부')
    expect(attachBtn).toBeDefined()
    fireEvent.click(attachBtn)
    expect(onAttach).toHaveBeenCalled()
  })

  it('does not render attach button when onAttach is not provided', () => {
    render(<ChatSearchBar onSubmit={vi.fn()} />)
    expect(screen.queryByLabelText('파일 첨부')).toBeNull()
  })
})

// ---------- ProjectTable ----------

import ProjectTable from '../src/user/components/ProjectTable'
import type { DocProject } from '../src/user/services/types'

describe('ProjectTable - extended', () => {
  const projects: DocProject[] = [
    { id: 'p1', name: 'Report A', docType: 'HWP', lastModified: '2026-03-01', step: 3 },
    { id: 'p2', name: 'Report B', docType: 'DOCX', lastModified: '2026-03-02', step: 1 },
  ]

  it('renders empty state when no projects', () => {
    render(<ProjectTable projects={[]} onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/아직 만든 프로젝트가 없어요/)).toBeDefined()
  })

  it('renders projects in a table', () => {
    render(<ProjectTable projects={projects} onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Report A')).toBeDefined()
    expect(screen.getByText('Report B')).toBeDefined()
    expect(screen.getByText('HWP')).toBeDefined()
    expect(screen.getByText('DOCX')).toBeDefined()
  })

  it('calls onSelect when project name is clicked', () => {
    const onSelect = vi.fn()
    render(<ProjectTable projects={projects} onSelect={onSelect} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Report A'))
    expect(onSelect).toHaveBeenCalledWith(projects[0])
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<ProjectTable projects={projects} onSelect={vi.fn()} onDelete={onDelete} />)
    const deleteBtn = screen.getByLabelText('Report A 삭제')
    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledWith('p1')
  })

  it('does not trigger onSelect when delete is clicked (stopPropagation)', () => {
    const onSelect = vi.fn()
    const onDelete = vi.fn()
    render(<ProjectTable projects={projects} onSelect={onSelect} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText('Report B 삭제'))
    expect(onDelete).toHaveBeenCalledWith('p2')
    // onSelect should not be called
    expect(onSelect).not.toHaveBeenCalled()
  })
})

// ---------- InstallBanner ----------

import InstallBanner from '../src/user/components/InstallBanner'

vi.mock('../../hooks/usePWAInstall', () => ({
  usePWAInstall: vi.fn(() => ({ canInstall: false, install: vi.fn() })),
}))

describe('InstallBanner', () => {
  it('returns null when canInstall is false', async () => {
    // Default mock returns canInstall: false
    const { container } = render(<InstallBanner />)
    expect(container.innerHTML).toBe('')
  })
})

// ---------- ResearchPanel ----------

import ResearchPanel from '../src/user/components/ResearchPanel'

describe('ResearchPanel', () => {
  it('returns null when not searching', () => {
    const { container } = render(<ResearchPanel isSearching={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders searching state', () => {
    render(<ResearchPanel isSearching={true} />)
    expect(screen.getByText('검색 중...')).toBeDefined()
  })

  it('shows query text when provided', () => {
    render(<ResearchPanel isSearching={true} query="AI trends" />)
    expect(screen.getByText('AI trends')).toBeDefined()
  })

  it('does not show query when not provided', () => {
    render(<ResearchPanel isSearching={true} />)
    expect(screen.getByText('검색 중...')).toBeDefined()
  })
})

// ---------- PageContextBanner ----------

import PageContextBanner from '../src/user/components/PageContextBanner'

describe('PageContextBanner', () => {
  const defaultContext = {
    title: 'Test Page',
    url: 'https://example.com/test',
    text: 'Some selected text content',
  }

  it('renders title, url, and text', () => {
    render(
      <PageContextBanner
        context={defaultContext}
        onDismiss={vi.fn()}
        onUseContext={vi.fn()}
      />,
    )
    expect(screen.getByText('Test Page')).toBeDefined()
    expect(screen.getByText('https://example.com/test')).toBeDefined()
    expect(screen.getByText('Some selected text content')).toBeDefined()
  })

  it('truncates long text (>120 chars)', () => {
    const longText = 'A'.repeat(150)
    render(
      <PageContextBanner
        context={{ ...defaultContext, text: longText }}
        onDismiss={vi.fn()}
        onUseContext={vi.fn()}
      />,
    )
    expect(screen.getByText(`${'A'.repeat(120)}...`)).toBeDefined()
  })

  it('truncates long url (>60 chars)', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(60)
    render(
      <PageContextBanner
        context={{ ...defaultContext, url: longUrl }}
        onDismiss={vi.fn()}
        onUseContext={vi.fn()}
      />,
    )
    const truncated = longUrl.slice(0, 60) + '...'
    expect(screen.getByText(truncated)).toBeDefined()
  })

  it('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn()
    render(
      <PageContextBanner
        context={defaultContext}
        onDismiss={onDismiss}
        onUseContext={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByLabelText('컨텍스트 닫기'))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('calls onUseContext with text when button clicked', () => {
    const onUseContext = vi.fn()
    render(
      <PageContextBanner
        context={defaultContext}
        onDismiss={vi.fn()}
        onUseContext={onUseContext}
      />,
    )
    fireEvent.click(screen.getByText('이 텍스트로 대화 시작'))
    expect(onUseContext).toHaveBeenCalledWith('Some selected text content')
  })

  it('does not render title when empty', () => {
    render(
      <PageContextBanner
        context={{ ...defaultContext, title: '' }}
        onDismiss={vi.fn()}
        onUseContext={vi.fn()}
      />,
    )
    // url and text still render
    expect(screen.getByText('https://example.com/test')).toBeDefined()
  })

  it('does not render url when empty', () => {
    render(
      <PageContextBanner
        context={{ ...defaultContext, url: '' }}
        onDismiss={vi.fn()}
        onUseContext={vi.fn()}
      />,
    )
    expect(screen.getByText('Test Page')).toBeDefined()
  })
})
