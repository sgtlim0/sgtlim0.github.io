import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DesktopSidebar from '../src/desktop/DesktopSidebar'
import DesktopChatBubble from '../src/desktop/DesktopChatBubble'
import AgentCard from '../src/desktop/AgentCard'
import ToolGrid from '../src/desktop/ToolGrid'
import type { DesktopMessage, DesktopAgent, DesktopTool } from '../src/desktop/types'

describe('DesktopSidebar', () => {
  it('renders navigation items', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={() => {}} />)
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('AI Tools')).toBeInTheDocument()
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

  it('hides labels when collapsed', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={() => {}} collapsed />)
    expect(screen.queryByText('H Chat Desktop')).not.toBeInTheDocument()
  })

  it('renders user name', () => {
    render(<DesktopSidebar activeItem="chat" onItemClick={() => {}} userName="Alice" />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
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

  it('shows token count when provided', () => {
    render(<DesktopChatBubble message={assistantMsg} />)
    expect(screen.getByText('150 tokens')).toBeInTheDocument()
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
})
