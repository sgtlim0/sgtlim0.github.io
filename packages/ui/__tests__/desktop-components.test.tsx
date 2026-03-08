import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DesktopSidebar from '../src/desktop/DesktopSidebar'
import DesktopChatBubble from '../src/desktop/DesktopChatBubble'
import AgentCard from '../src/desktop/AgentCard'
import ToolGrid from '../src/desktop/ToolGrid'
import SwarmPanel from '../src/desktop/SwarmPanel'
import DebateArena from '../src/desktop/DebateArena'
import type {
  DesktopMessage,
  DesktopAgent,
  DesktopTool,
  SwarmAgent,
  DebateParticipant,
  DebateMessage,
} from '../src/desktop/types'

describe('DesktopSidebar', () => {
  const mockOnItemClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navigation items', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={() => {}} />)
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('AI Tools')).toBeInTheDocument()
  })

  it('renders all 8 navigation items', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={mockOnItemClick} />)
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Group Chat')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('Swarm')).toBeInTheDocument()
    expect(screen.getByText('Debate')).toBeInTheDocument()
    expect(screen.getByText('AI Tools')).toBeInTheDocument()
    expect(screen.getByText('Image Gen')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders app title', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={() => {}} />)
    expect(screen.getByText('H Chat Desktop')).toBeInTheDocument()
  })

  it('calls onItemClick when item clicked', () => {
    const handleClick = vi.fn()
    render(<DesktopSidebar activeItem="chat" onItemClick={handleClick} />)
    fireEvent.click(screen.getByText('Agent'))
    expect(handleClick).toHaveBeenCalledWith('agent')
  })

  it('highlights active item with correct styles', () => {
    render(<DesktopSidebar activeItem="swarm" onItemClick={mockOnItemClick} />)
    const swarmButton = screen.getByRole('button', { name: /Swarm/i })
    expect(swarmButton).toHaveClass('bg-[var(--dt-primary)]', 'text-white')
  })

  it('hides labels when collapsed', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={() => {}} collapsed />)
    expect(screen.queryByText('H Chat Desktop')).not.toBeInTheDocument()
  })

  it('shows abbreviations when collapsed', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={mockOnItemClick} collapsed />)
    expect(screen.getByText('C')).toBeInTheDocument() // Chat
    expect(screen.getByText('G')).toBeInTheDocument() // Group Chat
    expect(screen.getByText('A')).toBeInTheDocument() // Agent
    expect(screen.getByText('S')).toBeInTheDocument() // Swarm
  })

  it('renders user name', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={() => {}} userName="Alice" />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders user email when provided', () => {
    render(
      <DesktopSidebar
        activeItem="chat"
        onItemClick={mockOnItemClick}
        userName="Alice"
        userEmail="alice@example.com"
      />,
    )
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('renders user avatar with first letter', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={mockOnItemClick} userName="Bob" />)
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('handles default userName', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={mockOnItemClick} />)
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument()
  })
})

describe('DesktopChatBubble', () => {
  const userMsg: DesktopMessage = {
    id: '1',
    role: 'user',
    content: 'Hello world',
    timestamp: Date.now(),
  }

  const assistantMsg: DesktopMessage = {
    id: '2',
    role: 'assistant',
    content: 'Hi there',
    timestamp: Date.now(),
    tokens: 150,
  }

  it('renders user message content', () => {
    render(<DesktopChatBubble message={userMsg} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders assistant message content', () => {
    render(<DesktopChatBubble message={assistantMsg} />)
    expect(screen.getByText('Hi there')).toBeInTheDocument()
  })

  it('shows model name badge for assistant', () => {
    render(<DesktopChatBubble message={assistantMsg} modelName="GPT-4o" />)
    expect(screen.getByText('GPT-4o')).toBeInTheDocument()
  })

  it('does not show model name for user messages', () => {
    render(<DesktopChatBubble message={userMsg} modelName="GPT-4o" />)
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument()
  })

  it('shows token count when provided', () => {
    render(<DesktopChatBubble message={assistantMsg} />)
    expect(screen.getByText('150 tokens')).toBeInTheDocument()
  })

  it('does not show token count when zero', () => {
    const msgNoTokens = { ...assistantMsg, tokens: 0 }
    render(<DesktopChatBubble message={msgNoTokens} />)
    expect(screen.queryByText('tokens')).not.toBeInTheDocument()
  })

  it('formats timestamp as relative time', () => {
    const recentMsg = { ...userMsg, timestamp: Date.now() - 5000 } // 5 seconds ago
    render(<DesktopChatBubble message={recentMsg} />)
    expect(screen.getByText('방금')).toBeInTheDocument()
  })

  it('aligns user messages to right', () => {
    const { container } = render(<DesktopChatBubble message={userMsg} />)
    // Check if the root element has justify-end
    const rootDiv = container.firstChild as HTMLElement
    expect(rootDiv).toHaveClass('justify-end')
  })

  it('aligns assistant messages to left', () => {
    const { container } = render(<DesktopChatBubble message={assistantMsg} />)
    // Check if the root element has justify-start
    const rootDiv = container.firstChild as HTMLElement
    expect(rootDiv).toHaveClass('justify-start')
  })

  it('applies user message styles', () => {
    render(<DesktopChatBubble message={userMsg} />)
    const bubble = screen.getByText('Hello world').parentElement
    expect(bubble).toHaveClass('bg-[var(--dt-primary)]', 'text-white')
  })

  it('applies assistant message styles', () => {
    render(<DesktopChatBubble message={assistantMsg} />)
    const bubble = screen.getByText('Hi there').parentElement
    expect(bubble).toHaveClass('bg-[var(--dt-bg-section)]', 'text-[var(--dt-text-primary)]')
  })
})

describe('AgentCard', () => {
  const agent: DesktopAgent = {
    id: 'a1',
    name: 'Code Reviewer',
    description: 'Reviews code quality',
    icon: 'CR',
    model: 'GPT-4o',
    systemPrompt: 'You are a code reviewer',
    category: 'coding',
    isActive: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders agent name and description', () => {
    render(<AgentCard agent={agent} />)
    expect(screen.getByText('Code Reviewer')).toBeInTheDocument()
    expect(screen.getByText('Reviews code quality')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<AgentCard agent={agent} />)
    expect(screen.getByText('coding')).toBeInTheDocument()
  })

  it('renders model name', () => {
    render(<AgentCard agent={agent} />)
    expect(screen.getByText('GPT-4o')).toBeInTheDocument()
  })

  it('renders agent icon', () => {
    render(<AgentCard agent={agent} />)
    expect(screen.getByText('CR')).toBeInTheDocument()
  })

  it('calls onStart with agent id', () => {
    const handleStart = vi.fn()
    render(<AgentCard agent={agent} onStart={handleStart} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleStart).toHaveBeenCalledWith('a1')
  })

  it('disables start button when inactive', () => {
    const inactiveAgent = { ...agent, isActive: false }
    render(<AgentCard agent={inactiveAgent} onStart={() => {}} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not render start button when onStart not provided', () => {
    render(<AgentCard agent={agent} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('applies opacity when inactive', () => {
    const inactiveAgent = { ...agent, isActive: false }
    const { container } = render(<AgentCard agent={inactiveAgent} />)
    expect(container.firstChild).toHaveClass('opacity-50')
  })

  it('shows active status indicator', () => {
    const { container } = render(<AgentCard agent={agent} />)
    const statusDot = container.querySelector('.bg-\\[var\\(--dt-accent\\)\\]')
    expect(statusDot).toBeInTheDocument()
  })

  it('shows inactive status indicator', () => {
    const inactiveAgent = { ...agent, isActive: false }
    const { container } = render(<AgentCard agent={inactiveAgent} />)
    const statusDot = container.querySelector('.bg-\\[var\\(--dt-text-muted\\)\\]')
    expect(statusDot).toBeInTheDocument()
  })

  it('handles all category types', () => {
    const categories: Array<DesktopAgent['category']> = [
      'general',
      'coding',
      'writing',
      'analysis',
      'creative',
    ]
    categories.forEach((cat) => {
      const agentWithCat = { ...agent, category: cat }
      const { rerender } = render(<AgentCard agent={agentWithCat} />)
      expect(screen.getByText(cat)).toBeInTheDocument()
      rerender(<></>)
    })
  })
})

describe('ToolGrid', () => {
  const tools: DesktopTool[] = [
    {
      id: 'search',
      name: 'Search',
      description: 'Web search',
      icon: 'S',
      category: 'search',
      isAvailable: true,
    },
    {
      id: 'edit',
      name: 'Code Edit',
      description: 'Edit code',
      icon: 'E',
      category: 'code',
      isAvailable: true,
    },
    {
      id: 'deploy',
      name: 'Deploy',
      description: 'Deploy app',
      icon: 'D',
      category: 'data',
      isAvailable: false,
    },
  ]

  const mockOnSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all tools', () => {
    render(<ToolGrid tools={tools} />)
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Code Edit')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
  })

  it('disables unavailable tool buttons', () => {
    render(<ToolGrid tools={tools} />)
    const buttons = screen.getAllByRole('button')
    const deployBtn = buttons.find((b) => b.textContent?.includes('Deploy'))
    expect(deployBtn).toBeDisabled()
  })

  it('renders empty state when no tools', () => {
    render(<ToolGrid tools={[]} />)
    expect(screen.getByText('사용 가능한 도구가 없습니다')).toBeInTheDocument()
  })

  it('renders category badges', () => {
    render(<ToolGrid tools={tools} />)
    expect(screen.getByText('search')).toBeInTheDocument()
    expect(screen.getByText('code')).toBeInTheDocument()
  })

  it('calls onSelect for available tools', () => {
    render(<ToolGrid tools={tools} onSelect={mockOnSelect} />)
    const searchBtn = screen.getByRole('button', { name: /Search/i })
    fireEvent.click(searchBtn)
    expect(mockOnSelect).toHaveBeenCalledWith(tools[0])
  })

  it('does not call onSelect for unavailable tools', () => {
    render(<ToolGrid tools={tools} onSelect={mockOnSelect} />)
    const deployBtn = screen.getByRole('button', { name: /Deploy/i })
    fireEvent.click(deployBtn)
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('renders tool icons', () => {
    render(<ToolGrid tools={tools} />)
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('applies disabled styles to unavailable tools', () => {
    render(<ToolGrid tools={tools} />)
    const deployBtn = screen.getByRole('button', { name: /Deploy/i })
    expect(deployBtn).toHaveClass('opacity-40', 'cursor-not-allowed')
  })

  it('renders grid layout', () => {
    const { container } = render(<ToolGrid tools={tools} />)
    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4')
  })

  it('handles all category types', () => {
    const allCategories: DesktopTool[] = [
      { id: '1', name: 'Image', category: 'image', isAvailable: true } as DesktopTool,
      { id: '2', name: 'Code', category: 'code', isAvailable: true } as DesktopTool,
      { id: '3', name: 'Text', category: 'text', isAvailable: true } as DesktopTool,
      { id: '4', name: 'Data', category: 'data', isAvailable: true } as DesktopTool,
      { id: '5', name: 'Search', category: 'search', isAvailable: true } as DesktopTool,
    ]
    render(<ToolGrid tools={allCategories} />)
    expect(screen.getByText('image')).toBeInTheDocument()
    expect(screen.getByText('code')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()
    expect(screen.getByText('data')).toBeInTheDocument()
    expect(screen.getByText('search')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// SwarmPanel
// ---------------------------------------------------------------------------
describe('SwarmPanel', () => {
  const agents: SwarmAgent[] = [
    { id: 's1', name: 'Agent A', role: 'Researcher', model: 'GPT-4', status: 'done', avatar: 'R' },
    { id: 's2', name: 'Agent B', role: 'Writer', model: 'Claude', status: 'thinking', avatar: 'W' },
    { id: 's3', name: 'Agent C', role: 'Editor', model: 'Gemini', status: 'idle', avatar: 'E' },
  ]

  it('renders agent names', () => {
    render(<SwarmPanel agents={agents} />)
    expect(screen.getByText('Agent A')).toBeInTheDocument()
    expect(screen.getByText('Agent B')).toBeInTheDocument()
    expect(screen.getByText('Agent C')).toBeInTheDocument()
  })

  it('shows completed count', () => {
    render(<SwarmPanel agents={agents} />)
    expect(screen.getByText('1 / 3 완료')).toBeInTheDocument()
  })

  it('renders progress bar when progress is provided', () => {
    const { container } = render(<SwarmPanel agents={agents} progress={60} />)
    const progressBar = container.querySelector('div[style]')
    expect(progressBar?.getAttribute('style')).toContain('60%')
  })

  it('shows empty state when no agents', () => {
    render(<SwarmPanel agents={[]} />)
    expect(screen.getByText('에이전트가 없습니다')).toBeInTheDocument()
  })

  it('clamps progress to 100 for values above 100', () => {
    const { container } = render(<SwarmPanel agents={agents} progress={150} />)
    const progressBar = container.querySelector('div[style]')
    expect(progressBar?.getAttribute('style')).toContain('100%')
  })

  it('clamps progress to 0 for negative values', () => {
    const { container } = render(<SwarmPanel agents={agents} progress={-10} />)
    const progressBar = container.querySelector('div[style]')
    expect(progressBar?.getAttribute('style')).toContain('0%')
  })

  it('displays status labels for each agent', () => {
    render(<SwarmPanel agents={agents} />)
    expect(screen.getByText('완료')).toBeInTheDocument()
    expect(screen.getByText('사고 중')).toBeInTheDocument()
    expect(screen.getByText('대기')).toBeInTheDocument()
  })

  it('displays role and model info', () => {
    render(<SwarmPanel agents={agents} />)
    expect(screen.getByText(/Researcher/)).toBeInTheDocument()
    expect(screen.getByText(/Writer/)).toBeInTheDocument()
  })

  it('does not render progress bar when progress is not provided', () => {
    const { container } = render(<SwarmPanel agents={agents} />)
    const bars = container.querySelectorAll('.rounded-full.bg-\\[var\\(--dt-primary\\)\\]')
    // The progress bar div should not exist
    expect(bars.length).toBe(0)
  })

  it('renders responding status', () => {
    const respondingAgents: SwarmAgent[] = [
      { id: 's4', name: 'Agent D', role: 'Coder', model: 'GPT-4', status: 'responding', avatar: 'D' },
    ]
    render(<SwarmPanel agents={respondingAgents} />)
    expect(screen.getByText('응답 중')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// DebateArena
// ---------------------------------------------------------------------------
describe('DebateArena', () => {
  const participants: DebateParticipant[] = [
    { id: 'p1', name: 'Pro A', position: 'for', model: 'GPT-4', avatar: 'P' },
    { id: 'p2', name: 'Con A', position: 'against', model: 'Claude', avatar: 'C' },
    { id: 'p3', name: 'Moderator', position: 'moderator', model: 'Gemini', avatar: 'M' },
  ]

  const messages: DebateMessage[] = [
    { participantId: 'p1', content: '찬성 발언입니다', round: 1 },
    { participantId: 'p2', content: '반대 발언입니다', round: 1 },
    { participantId: 'p1', content: '반박합니다', round: 2 },
  ]

  it('renders participant names', () => {
    render(<DebateArena participants={participants} messages={messages} />)
    expect(screen.getAllByText('Pro A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Con A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Moderator').length).toBeGreaterThan(0)
  })

  it('renders position labels', () => {
    render(<DebateArena participants={participants} messages={messages} />)
    expect(screen.getAllByText('찬성').length).toBeGreaterThan(0)
    expect(screen.getAllByText('반대').length).toBeGreaterThan(0)
    expect(screen.getAllByText('사회자').length).toBeGreaterThan(0)
  })

  it('renders message content grouped by round', () => {
    render(<DebateArena participants={participants} messages={messages} />)
    expect(screen.getByText('찬성 발언입니다')).toBeInTheDocument()
    expect(screen.getByText('반대 발언입니다')).toBeInTheDocument()
    expect(screen.getByText('반박합니다')).toBeInTheDocument()
  })

  it('shows round headers', () => {
    render(<DebateArena participants={participants} messages={messages} />)
    expect(screen.getByText('Round 1')).toBeInTheDocument()
    expect(screen.getByText('Round 2')).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(<DebateArena participants={participants} messages={[]} />)
    expect(screen.getByText('토론이 시작되지 않았습니다')).toBeInTheDocument()
  })

  it('renders participant avatars', () => {
    render(<DebateArena participants={participants} messages={messages} />)
    expect(screen.getAllByText('P').length).toBeGreaterThan(0)
    expect(screen.getAllByText('C').length).toBeGreaterThan(0)
    expect(screen.getAllByText('M').length).toBeGreaterThan(0)
  })

  it('renders model info for participants', () => {
    render(<DebateArena participants={participants} messages={messages} />)
    expect(screen.getByText('GPT-4')).toBeInTheDocument()
    expect(screen.getByText('Claude')).toBeInTheDocument()
    expect(screen.getByText('Gemini')).toBeInTheDocument()
  })

  it('skips messages for unknown participant ids', () => {
    const badMessages: DebateMessage[] = [
      { participantId: 'unknown', content: 'should not show', round: 1 },
      { participantId: 'p1', content: '정상 발언', round: 1 },
    ]
    render(<DebateArena participants={participants} messages={badMessages} />)
    expect(screen.queryByText('should not show')).not.toBeInTheDocument()
    expect(screen.getByText('정상 발언')).toBeInTheDocument()
  })
})
