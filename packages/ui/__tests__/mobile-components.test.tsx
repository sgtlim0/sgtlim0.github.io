import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileTabBar from '../src/mobile/MobileTabBar'
import MobileChatList from '../src/mobile/MobileChatList'
import MobileAssistantList from '../src/mobile/MobileAssistantList'
import MobileHeader from '../src/mobile/MobileHeader'
import type { MobileChat, MobileAssistant } from '../src/mobile/types'

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

  it('shows unread badge when count > 0', () => {
    render(<MobileHeader title="H Chat" unreadCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not show badge when count is 0', () => {
    render(<MobileHeader title="H Chat" unreadCount={0} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
