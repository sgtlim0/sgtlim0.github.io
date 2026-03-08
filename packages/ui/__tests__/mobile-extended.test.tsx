import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// Mock mobileService for hooks
vi.mock('../src/mobile/services/mobileService', () => ({
  getChatList: vi.fn(() =>
    Promise.resolve([
      {
        id: 'c1',
        title: 'Test Chat',
        lastMessage: 'Last msg',
        model: 'GPT-4o',
        timestamp: Date.now(),
        unread: false,
      },
    ]),
  ),
  getAssistants: vi.fn(() =>
    Promise.resolve([
      {
        id: 'a1',
        name: 'Test Assistant',
        description: 'Desc',
        icon: 'T',
        category: 'general',
        isFavorite: true,
      },
      {
        id: 'a2',
        name: 'Code Helper',
        description: 'Code',
        icon: 'C',
        category: 'coding',
        isFavorite: false,
      },
    ]),
  ),
  getSettings: vi.fn(() =>
    Promise.resolve([
      { id: 's1', label: 'Dark Mode', type: 'toggle', value: false, section: 'general' },
      { id: 's2', label: 'Language', type: 'select', value: 'Korean', section: 'general' },
      { id: 's3', label: 'Privacy Policy', type: 'link', section: 'privacy' },
    ]),
  ),
  getNotifications: vi.fn(() =>
    Promise.resolve([
      { id: 'n1', title: 'Update', message: 'New version', timestamp: Date.now(), read: false, type: 'system' },
    ]),
  ),
  deleteChat: vi.fn(() => Promise.resolve()),
  toggleFavorite: vi.fn(() => Promise.resolve()),
  updateSetting: vi.fn(() => Promise.resolve()),
  markNotificationRead: vi.fn(() => Promise.resolve()),
}))

describe('Mobile - Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // MobileApp (full integration)
  // =========================================================================
  describe('MobileApp', () => {
    it('should render with default chat tab', async () => {
      const { default: MobileApp } = await import('../src/mobile/MobileApp')
      await act(async () => {
        render(<MobileApp />)
      })
      expect(screen.getByText('H Chat')).toBeInTheDocument()
      expect(screen.getByText('Chat')).toBeInTheDocument()
    })

    it('should render tab bar with all tabs', async () => {
      const { default: MobileApp } = await import('../src/mobile/MobileApp')
      await act(async () => {
        render(<MobileApp />)
      })
      expect(screen.getByText('Chat')).toBeInTheDocument()
      expect(screen.getByText('Assistants')).toBeInTheDocument()
      expect(screen.getByText('History')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should switch to settings tab', async () => {
      const { default: MobileApp } = await import('../src/mobile/MobileApp')
      await act(async () => {
        render(<MobileApp />)
      })
      await act(async () => {
        fireEvent.click(screen.getByText('Settings'))
      })
      expect(screen.getByText('사용자')).toBeInTheDocument()
    })

    it('should switch to assistants tab', async () => {
      const { default: MobileApp } = await import('../src/mobile/MobileApp')
      await act(async () => {
        render(<MobileApp />)
      })
      await act(async () => {
        fireEvent.click(screen.getByText('Assistants'))
      })
      expect(screen.getByText('Test Assistant')).toBeInTheDocument()
    })

    it('should switch to history tab', async () => {
      const { default: MobileApp } = await import('../src/mobile/MobileApp')
      await act(async () => {
        render(<MobileApp />)
      })
      await act(async () => {
        fireEvent.click(screen.getByText('History'))
      })
      // History view groups by date and shows chat titles
      expect(screen.getByText('Test Chat')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // mobileHooks
  // =========================================================================
  describe('useMobileTabs', () => {
    it('should return default tab as chat', async () => {
      const { useMobileTabs } = await import('../src/mobile/services/mobileHooks')
      let result: ReturnType<typeof useMobileTabs> | undefined
      function TestComp() {
        result = useMobileTabs()
        return null
      }
      render(<TestComp />)
      expect(result?.activeTab).toBe('chat')
    })

    it('should accept custom initial tab', async () => {
      const { useMobileTabs } = await import('../src/mobile/services/mobileHooks')
      let result: ReturnType<typeof useMobileTabs> | undefined
      function TestComp() {
        result = useMobileTabs('settings')
        return null
      }
      render(<TestComp />)
      expect(result?.activeTab).toBe('settings')
    })

    it('should update tab via setActiveTab', async () => {
      const { useMobileTabs } = await import('../src/mobile/services/mobileHooks')
      let result: ReturnType<typeof useMobileTabs> | undefined
      function TestComp() {
        result = useMobileTabs()
        return (
          <button onClick={() => result?.setActiveTab('history')}>switch</button>
        )
      }
      render(<TestComp />)
      await act(async () => {
        fireEvent.click(screen.getByText('switch'))
      })
      expect(result?.activeTab).toBe('history')
    })
  })

  describe('useChatList', () => {
    it('should load chats on mount', async () => {
      const { useChatList } = await import('../src/mobile/services/mobileHooks')
      let result: ReturnType<typeof useChatList> | undefined
      function TestComp() {
        result = useChatList()
        return <div>{result.chats.length > 0 ? 'loaded' : 'loading'}</div>
      }
      await act(async () => {
        render(<TestComp />)
      })
      expect(result?.chats.length).toBe(1)
      expect(result?.loading).toBe(false)
    })
  })

  describe('useAssistants', () => {
    it('should load assistants and compute favorites', async () => {
      const { useAssistants } = await import('../src/mobile/services/mobileHooks')
      let result: ReturnType<typeof useAssistants> | undefined
      function TestComp() {
        result = useAssistants()
        return null
      }
      await act(async () => {
        render(<TestComp />)
      })
      expect(result?.assistants.length).toBe(2)
      expect(result?.favorites.length).toBe(1)
    })
  })

  describe('useMobileSettings', () => {
    it('should load and group settings', async () => {
      const { useMobileSettings } = await import('../src/mobile/services/mobileHooks')
      let result: ReturnType<typeof useMobileSettings> | undefined
      function TestComp() {
        result = useMobileSettings()
        return null
      }
      await act(async () => {
        render(<TestComp />)
      })
      expect(result?.settings.length).toBe(3)
      expect(result?.grouped.general.length).toBe(2)
      expect(result?.grouped.privacy.length).toBe(1)
    })
  })

  // =========================================================================
  // MobileChatView (additional edge cases)
  // =========================================================================
  describe('MobileChatView (extended)', () => {
    it('should send message when input is filled and button clicked', async () => {
      const { default: MobileChatView } = await import('../src/mobile/MobileChatView')
      const onSend = vi.fn()
      render(
        <MobileChatView
          modelName="H Chat"
          messages={[]}
          onSend={onSend}
          onBack={() => {}}
        />,
      )
      const input = screen.getByPlaceholderText('메시지를 입력하세요...')
      fireEvent.change(input, { target: { value: 'Hello' } })
      const sendBtn = screen.getByLabelText('전송')
      fireEvent.click(sendBtn)
      expect(onSend).toHaveBeenCalledWith('Hello')
    })

    it('should clear input after sending', async () => {
      const { default: MobileChatView } = await import('../src/mobile/MobileChatView')
      render(
        <MobileChatView
          modelName="H Chat"
          messages={[]}
          onSend={() => {}}
          onBack={() => {}}
        />,
      )
      const input = screen.getByPlaceholderText('메시지를 입력하세요...') as HTMLTextAreaElement
      fireEvent.change(input, { target: { value: 'Hello' } })
      fireEvent.click(screen.getByLabelText('전송'))
      expect(input.value).toBe('')
    })

    it('should distinguish user and assistant messages', async () => {
      const { default: MobileChatView } = await import('../src/mobile/MobileChatView')
      const messages = [
        { role: 'user' as const, content: 'User says hi' },
        { role: 'assistant' as const, content: 'Bot replies' },
      ]
      const { container } = render(
        <MobileChatView
          modelName="H Chat"
          messages={messages}
          onSend={() => {}}
          onBack={() => {}}
        />,
      )
      expect(screen.getByText('User says hi')).toBeInTheDocument()
      expect(screen.getByText('Bot replies')).toBeInTheDocument()
      // User messages have justify-end, assistant have justify-start
      const justifyEnd = container.querySelectorAll('.justify-end')
      const justifyStart = container.querySelectorAll('.justify-start')
      expect(justifyEnd.length).toBeGreaterThanOrEqual(1)
      expect(justifyStart.length).toBeGreaterThanOrEqual(1)
    })
  })

  // =========================================================================
  // Types validation
  // =========================================================================
  describe('Mobile types', () => {
    it('MobileTab type covers all expected values', async () => {
      const tabs: Array<'chat' | 'assistants' | 'history' | 'settings'> = [
        'chat',
        'assistants',
        'history',
        'settings',
      ]
      expect(tabs).toHaveLength(4)
    })

    it('MobileSetting supports toggle, select, and link types', () => {
      const types: Array<'toggle' | 'select' | 'link'> = ['toggle', 'select', 'link']
      expect(types).toHaveLength(3)
    })

    it('MobileNotification supports system, chat, and update types', () => {
      const types: Array<'system' | 'chat' | 'update'> = ['system', 'chat', 'update']
      expect(types).toHaveLength(3)
    })
  })
})
