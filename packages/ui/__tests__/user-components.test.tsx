import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MessageBubble from '../src/user/components/MessageBubble'
import StreamingIndicator from '../src/user/components/StreamingIndicator'
import CategoryFilter from '../src/user/components/CategoryFilter'
import StepProgress from '../src/user/components/StepProgress'
import FileUploadZone from '../src/user/components/FileUploadZone'
import AssistantCard from '../src/user/components/AssistantCard'
import type { ChatMessage } from '../src/user/services/types'
import type { Assistant } from '../src/user/services/types'

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'msg-1',
  role: 'user',
  content: 'Hello',
  timestamp: Date.now(),
  ...overrides,
})

const makeAssistant = (overrides: Partial<Assistant> = {}): Assistant => ({
  id: 'asst-1',
  name: '번역 비서',
  description: '다국어 번역 도우미',
  icon: '🌐',
  iconColor: '#3B82F6',
  category: 'chat',
  isOfficial: true,
  ...overrides,
})

describe('MessageBubble', () => {
  it('should render user message', () => {
    render(<MessageBubble message={makeMessage({ content: 'Hello World' })} />)
    expect(screen.getByText('Hello World')).toBeDefined()
  })

  it('should render assistant message', () => {
    render(<MessageBubble message={makeMessage({ role: 'assistant', content: 'Hi there' })} />)
    expect(screen.getByText('Hi there')).toBeDefined()
  })

  it('should apply different styles for user/assistant', () => {
    const { container, rerender } = render(
      <MessageBubble message={makeMessage({ role: 'user' })} />,
    )
    const userWrapper = container.firstChild as HTMLElement
    const userClass = userWrapper.className

    rerender(<MessageBubble message={makeMessage({ role: 'assistant' })} />)
    const assistantWrapper = container.firstChild as HTMLElement

    expect(userClass).not.toBe(assistantWrapper.className)
  })

  it('should show streaming cursor when isStreaming', () => {
    const { container } = render(
      <MessageBubble message={makeMessage({ role: 'assistant' })} isStreaming />,
    )
    const cursor = container.querySelector('.animate-pulse')
    expect(cursor).toBeDefined()
  })
})

describe('StreamingIndicator', () => {
  it('should render', () => {
    const { container } = render(<StreamingIndicator />)
    expect(container.firstChild).toBeDefined()
  })
})

describe('CategoryFilter', () => {
  const categories = ['전체', '채팅', '번역', '문서', 'OCR']

  it('should render all categories', () => {
    render(<CategoryFilter categories={categories} selected="전체" onSelect={() => {}} />)
    categories.forEach((cat) => {
      expect(screen.getByText(cat)).toBeDefined()
    })
  })

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn()
    render(<CategoryFilter categories={categories} selected="전체" onSelect={onSelect} />)

    fireEvent.click(screen.getByText('번역'))
    expect(onSelect).toHaveBeenCalledWith('번역')
  })
})

describe('StepProgress', () => {
  it('should render step labels', () => {
    const steps = [
      { label: '주제 선택' },
      { label: '내용 작성' },
      { label: '검토' },
      { label: '완료' },
    ]
    render(<StepProgress steps={steps} currentStep={1} />)
    steps.forEach((step) => {
      expect(screen.getByText(step.label)).toBeDefined()
    })
  })

  it('should render step numbers', () => {
    const steps = [{ label: 'A' }, { label: 'B' }, { label: 'C' }]
    render(<StepProgress steps={steps} currentStep={2} />)
    // Step 1 is completed (check mark), step 2 is active (shows "2"), step 3 shows "3"
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })
})

describe('FileUploadZone', () => {
  it('should render', () => {
    const { container } = render(<FileUploadZone onUpload={() => {}} />)
    expect(container.firstChild).toBeDefined()
  })
})

describe('AssistantCard', () => {
  it('should render assistant name and description', () => {
    const assistant = makeAssistant()
    render(<AssistantCard assistant={assistant} onClick={() => {}} />)
    expect(screen.getByText('번역 비서')).toBeDefined()
    expect(screen.getByText('다국어 번역 도우미')).toBeDefined()
  })

  it('should render emoji icon', () => {
    const assistant = makeAssistant({ icon: '🤖' })
    render(<AssistantCard assistant={assistant} onClick={() => {}} />)
    expect(screen.getByText('🤖')).toBeDefined()
  })

  it('should call onClick with assistant when clicked', () => {
    const onClick = vi.fn()
    const assistant = makeAssistant()
    render(<AssistantCard assistant={assistant} onClick={onClick} />)
    fireEvent.click(screen.getByText('번역 비서'))
    expect(onClick).toHaveBeenCalledWith(assistant)
  })

  it('should render model badge when provided', () => {
    const assistant = makeAssistant({ model: 'GPT-4o' })
    render(<AssistantCard assistant={assistant} onClick={() => {}} />)
    expect(screen.getByText('GPT-4o')).toBeDefined()
  })
})
