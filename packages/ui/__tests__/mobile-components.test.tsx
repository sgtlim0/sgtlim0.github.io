import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileTabBar from '../src/mobile/MobileTabBar'
import MobileChatList from '../src/mobile/MobileChatList'
import MobileAssistantList from '../src/mobile/MobileAssistantList'
import MobileHeader from '../src/mobile/MobileHeader'
import MobileSettingsPage from '../src/mobile/MobileSettingsPage'
import MobileChatView from '../src/mobile/MobileChatView'
import type { MobileChat, MobileAssistant, MobileSetting, MobileChatMessage } from '../src/mobile/types'
import * as mobileService from '../src/mobile/services/mobileService'

describe('MobileTabBar', () => {
  it('renders all tab labels', () => {
    render(<MobileTabBar activeTab="chat" onTabChange={() => {}} />)
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Assistants')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('calls onTabChange when tab clicked', () => {
    const handleChange = vi.fn()
    render(<MobileTabBar activeTab="chat" onTabChange={handleChange} />)
    fireEvent.click(screen.getByText('Assistants'))
    expect(handleChange).toHaveBeenCalledWith('assistants')
  })
})

const mockChats: MobileChat[] = [
  {
    id: 'c1',
    title: '테스트 채팅',
    lastMessage: '안녕하세요',
    model: 'GPT-4o',
    timestamp: Date.now(),
    unread: true,
  },
  {
    id: 'c2',
    title: '두번째 채팅',
    lastMessage: '반갑습니다',
    model: 'Claude',
    timestamp: Date.now() - 60000,
    unread: false,
  },
]

describe('MobileChatList', () => {
  it('renders chat items', () => {
    render(<MobileChatList chats={mockChats} onSelect={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('테스트 채팅')).toBeInTheDocument()
    expect(screen.getByText('두번째 채팅')).toBeInTheDocument()
  })

  it('renders empty state when no chats', () => {
    render(<MobileChatList chats={[]} onSelect={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('대화를 시작해보세요')).toBeInTheDocument()
  })

  it('calls onDelete with chat id', () => {
    const handleDelete = vi.fn()
    render(<MobileChatList chats={mockChats} onSelect={() => {}} onDelete={handleDelete} />)
    const deleteBtn = screen.getByLabelText('테스트 채팅 삭제')
    fireEvent.click(deleteBtn)
    expect(handleDelete).toHaveBeenCalledWith('c1')
  })
})

const mockAssistants: MobileAssistant[] = [
  {
    id: 'a1',
    name: '코드 도우미',
    description: '코드 리뷰 전문',
    icon: '💻',
    category: '코딩',
    isFavorite: true,
  },
  {
    id: 'a2',
    name: '번역가',
    description: '다국어 번역',
    icon: '🌐',
    category: '번역',
    isFavorite: false,
  },
]

describe('MobileAssistantList', () => {
  it('renders assistant names', () => {
    render(
      <MobileAssistantList
        assistants={mockAssistants}
        onStart={() => {}}
        onToggleFavorite={() => {}}
      />,
    )
    expect(screen.getByText('코드 도우미')).toBeInTheDocument()
    expect(screen.getByText('번역가')).toBeInTheDocument()
  })

  it('renders category filter chips', () => {
    render(
      <MobileAssistantList
        assistants={mockAssistants}
        onStart={() => {}}
        onToggleFavorite={() => {}}
      />,
    )
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getAllByText('코딩').length).toBeGreaterThanOrEqual(1)
  })

  it('calls onStart with assistant id', () => {
    const handleStart = vi.fn()
    render(
      <MobileAssistantList
        assistants={mockAssistants}
        onStart={handleStart}
        onToggleFavorite={() => {}}
      />,
    )
    const startButtons = screen.getAllByText('대화 시작')
    fireEvent.click(startButtons[0])
    expect(handleStart).toHaveBeenCalledWith('a1')
  })
})

describe('MobileHeader', () => {
  it('renders title', () => {
    render(<MobileHeader title="H Chat" />)
    expect(screen.getByText('H Chat')).toBeInTheDocument()
  })

  it('renders default title when none provided', () => {
    render(<MobileHeader />)
    expect(screen.getByText('H Chat')).toBeInTheDocument()
  })

  it('shows unread badge when count > 0', () => {
    render(<MobileHeader title="H Chat" unreadCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows 99+ for unread count over 99', () => {
    render(<MobileHeader unreadCount={150} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('does not show badge when count is 0', () => {
    render(<MobileHeader title="H Chat" unreadCount={0} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('calls onNotification when bell clicked', () => {
    const onNotification = vi.fn()
    render(<MobileHeader onNotification={onNotification} />)
    fireEvent.click(screen.getByLabelText('알림'))
    expect(onNotification).toHaveBeenCalledOnce()
  })

  it('calls onProfile when avatar clicked', () => {
    const onProfile = vi.fn()
    render(<MobileHeader onProfile={onProfile} />)
    fireEvent.click(screen.getByLabelText('프로필'))
    expect(onProfile).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// MobileTabBar (additional)
// ---------------------------------------------------------------------------
describe('MobileTabBar (extended)', () => {
  it('renders abbreviation letters', () => {
    render(<MobileTabBar activeTab="chat" onTabChange={() => {}} />)
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('H')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('renders History tab label', () => {
    render(<MobileTabBar activeTab="history" onTabChange={() => {}} />)
    expect(screen.getByText('History')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// MobileChatList (additional)
// ---------------------------------------------------------------------------
describe('MobileChatList (extended)', () => {
  const chats: MobileChat[] = [
    {
      id: 'c1',
      title: '프로젝트 기획서',
      lastMessage: '초안 완성',
      model: 'H Chat Pro',
      timestamp: Date.now() - 1000,
      unread: true,
    },
    {
      id: 'c2',
      title: '영어 번역',
      lastMessage: '번역 결과',
      model: 'H Chat',
      timestamp: Date.now() - 100_000_000,
      unread: false,
    },
  ]

  it('calls onSelect with correct id', () => {
    const onSelect = vi.fn()
    render(<MobileChatList chats={chats} onSelect={onSelect} onDelete={() => {}} />)
    fireEvent.click(screen.getByText('프로젝트 기획서'))
    expect(onSelect).toHaveBeenCalledWith('c1')
  })

  it('renders model first character as avatar', () => {
    render(<MobileChatList chats={chats} onSelect={() => {}} onDelete={() => {}} />)
    // 'H Chat Pro' -> 'H'
    expect(screen.getAllByText('H').length).toBeGreaterThanOrEqual(1)
  })

  it('renders last message preview', () => {
    render(<MobileChatList chats={chats} onSelect={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('초안 완성')).toBeInTheDocument()
    expect(screen.getByText('번역 결과')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// MobileSettingsPage
// ---------------------------------------------------------------------------
describe('MobileSettingsPage', () => {
  const settings: MobileSetting[] = [
    { id: 's1', label: '다크 모드', type: 'toggle', value: false, section: 'general' },
    { id: 's2', label: '언어', type: 'select', value: '한국어', section: 'general' },
    { id: 's3', label: '개인정보 처리방침', type: 'link', section: 'privacy' },
  ]

  it('renders setting labels', () => {
    render(<MobileSettingsPage settings={settings} onUpdate={() => {}} />)
    expect(screen.getByText('다크 모드')).toBeInTheDocument()
    expect(screen.getByText('언어')).toBeInTheDocument()
  })

  it('renders user profile with custom name and email', () => {
    render(
      <MobileSettingsPage
        settings={settings}
        onUpdate={() => {}}
        userName="홍길동"
        userEmail="hong@test.com"
      />,
    )
    expect(screen.getByText('홍길동')).toBeInTheDocument()
    expect(screen.getByText('hong@test.com')).toBeInTheDocument()
  })

  it('renders toggle switch for toggle type', () => {
    render(<MobileSettingsPage settings={settings} onUpdate={() => {}} />)
    const toggles = screen.getAllByRole('switch')
    expect(toggles.length).toBeGreaterThanOrEqual(1)
  })

  it('calls onUpdate when toggle is clicked', () => {
    const onUpdate = vi.fn()
    render(<MobileSettingsPage settings={settings} onUpdate={onUpdate} />)
    const toggle = screen.getAllByRole('switch')[0]
    fireEvent.click(toggle)
    expect(onUpdate).toHaveBeenCalledWith('s1', true)
  })

  it('groups settings by section', () => {
    render(<MobileSettingsPage settings={settings} onUpdate={() => {}} />)
    expect(screen.getByText('general')).toBeInTheDocument()
    expect(screen.getByText('privacy')).toBeInTheDocument()
  })

  it('renders default user profile', () => {
    render(<MobileSettingsPage settings={settings} onUpdate={() => {}} />)
    expect(screen.getByText('사용자')).toBeInTheDocument()
    expect(screen.getByText('user@hchat.ai')).toBeInTheDocument()
  })

  it('renders select type setting with current value', () => {
    render(<MobileSettingsPage settings={settings} onUpdate={() => {}} />)
    expect(screen.getByText(/한국어/)).toBeInTheDocument()
  })

  it('renders link type setting with arrow', () => {
    render(<MobileSettingsPage settings={settings} onUpdate={() => {}} />)
    const arrows = screen.getAllByText('→')
    expect(arrows.length).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// MobileChatView
// ---------------------------------------------------------------------------
describe('MobileChatView', () => {
  const messages: MobileChatMessage[] = [
    { role: 'user', content: '안녕하세요' },
    { role: 'assistant', content: '반갑습니다!' },
  ]

  it('renders model name in header', () => {
    render(
      <MobileChatView
        modelName="H Chat Pro"
        messages={messages}
        onSend={() => {}}
        onBack={() => {}}
      />,
    )
    expect(screen.getByText('H Chat Pro')).toBeInTheDocument()
  })

  it('renders message contents', () => {
    render(
      <MobileChatView
        modelName="H Chat"
        messages={messages}
        onSend={() => {}}
        onBack={() => {}}
      />,
    )
    expect(screen.getByText('안녕하세요')).toBeInTheDocument()
    expect(screen.getByText('반갑습니다!')).toBeInTheDocument()
  })

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn()
    render(
      <MobileChatView
        modelName="H Chat"
        messages={[]}
        onSend={() => {}}
        onBack={onBack}
      />,
    )
    fireEvent.click(screen.getByLabelText('뒤로가기'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('shows streaming indicator when isStreaming is true', () => {
    const { container } = render(
      <MobileChatView
        modelName="H Chat"
        messages={messages}
        onSend={() => {}}
        onBack={() => {}}
        isStreaming
      />,
    )
    const bounceDots = container.querySelectorAll('.animate-bounce')
    expect(bounceDots.length).toBe(3)
  })

  it('disables send when input is empty', () => {
    render(
      <MobileChatView
        modelName="H Chat"
        messages={[]}
        onSend={() => {}}
        onBack={() => {}}
      />,
    )
    const sendBtn = screen.getByLabelText('전송')
    expect(sendBtn.hasAttribute('disabled')).toBe(true)
  })

  it('renders empty message list', () => {
    render(
      <MobileChatView
        modelName="H Chat"
        messages={[]}
        onSend={() => {}}
        onBack={() => {}}
      />,
    )
    expect(screen.getByText('H Chat')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// MobileAssistantList (extended)
// ---------------------------------------------------------------------------
describe('MobileAssistantList (extended)', () => {
  const assistants: MobileAssistant[] = [
    { id: 'a1', name: '범용 어시스턴트', description: 'AI 비서', icon: 'M', category: '일반', isFavorite: true },
    { id: 'a2', name: '코드 도우미', description: '코드 리뷰', icon: 'C', category: '코딩', isFavorite: false },
    { id: 'a3', name: '번역 전문가', description: '다국어 번역', icon: 'T', category: '번역', isFavorite: false },
  ]

  it('sorts favorites first', () => {
    const { container } = render(
      <MobileAssistantList assistants={assistants} onStart={() => {}} onToggleFavorite={() => {}} />,
    )
    const names = container.querySelectorAll('.text-sm.font-medium')
    expect(names[0]?.textContent).toBe('범용 어시스턴트')
  })

  it('filters by category when chip clicked', () => {
    render(
      <MobileAssistantList assistants={assistants} onStart={() => {}} onToggleFavorite={() => {}} />,
    )
    fireEvent.click(screen.getByText('번역'))
    expect(screen.getByText('번역 전문가')).toBeInTheDocument()
    expect(screen.queryByText('코드 도우미')).not.toBeInTheDocument()
  })

  it('calls onToggleFavorite with correct id', () => {
    const onToggle = vi.fn()
    render(
      <MobileAssistantList assistants={assistants} onStart={() => {}} onToggleFavorite={onToggle} />,
    )
    const starButtons = screen.getAllByText('☆')
    fireEvent.click(starButtons[0])
    expect(onToggle).toHaveBeenCalled()
  })

  it('shows filled star for favorites', () => {
    render(
      <MobileAssistantList assistants={assistants} onStart={() => {}} onToggleFavorite={() => {}} />,
    )
    expect(screen.getAllByText('★').length).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// mobileService (async functions)
// ---------------------------------------------------------------------------
describe('mobileService', () => {
  it('getChatList returns array with expected fields', async () => {
    const chats = await mobileService.getChatList()
    expect(Array.isArray(chats)).toBe(true)
    expect(chats.length).toBeGreaterThan(0)
    expect(chats[0]).toHaveProperty('id')
    expect(chats[0]).toHaveProperty('title')
    expect(chats[0]).toHaveProperty('model')
  })

  it('getAssistants returns array', async () => {
    const assistants = await mobileService.getAssistants()
    expect(Array.isArray(assistants)).toBe(true)
    expect(assistants.length).toBeGreaterThan(0)
    expect(assistants[0]).toHaveProperty('category')
  })

  it('getSettings returns array with sections', async () => {
    const settings = await mobileService.getSettings()
    expect(Array.isArray(settings)).toBe(true)
    for (const s of settings) {
      expect(s).toHaveProperty('section')
      expect(s).toHaveProperty('type')
    }
  })

  it('getNotifications returns array', async () => {
    const notifications = await mobileService.getNotifications()
    expect(Array.isArray(notifications)).toBe(true)
    expect(notifications[0]).toHaveProperty('type')
  })

  it('deleteChat removes a chat', async () => {
    const before = await mobileService.getChatList()
    const firstId = before[0].id
    await mobileService.deleteChat(firstId)
    const after = await mobileService.getChatList()
    expect(after.find((c) => c.id === firstId)).toBeUndefined()
  })

  it('toggleFavorite flips isFavorite', async () => {
    const before = await mobileService.getAssistants()
    const target = before[0]
    const wasFav = target.isFavorite
    await mobileService.toggleFavorite(target.id)
    const after = await mobileService.getAssistants()
    const updated = after.find((a) => a.id === target.id)
    expect(updated?.isFavorite).toBe(!wasFav)
  })

  it('updateSetting changes setting value', async () => {
    const before = await mobileService.getSettings()
    const toggle = before.find((s) => s.type === 'toggle')!
    await mobileService.updateSetting(toggle.id, true)
    const after = await mobileService.getSettings()
    const updated = after.find((s) => s.id === toggle.id)
    expect(updated?.value).toBe(true)
  })

  it('markNotificationRead marks a notification', async () => {
    const before = await mobileService.getNotifications()
    const unread = before.find((n) => !n.read)
    if (unread) {
      await mobileService.markNotificationRead(unread.id)
      const after = await mobileService.getNotifications()
      const updated = after.find((n) => n.id === unread.id)
      expect(updated?.read).toBe(true)
    }
  })
})
