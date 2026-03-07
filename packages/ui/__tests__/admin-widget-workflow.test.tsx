import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WidgetCard from '../src/admin/WidgetCard'
import WorkflowNodeCard from '../src/admin/WorkflowNodeCard'
import type { WidgetConfig } from '../src/admin/services/widgetTypes'
import type { WorkflowNode } from '../src/admin/services/workflowTypes'

const makeWidget = (overrides: Partial<WidgetConfig> = {}): WidgetConfig => ({
  id: 'widget-1',
  type: 'metric-card',
  title: 'Active Users',
  size: 'md',
  visible: true,
  position: { x: 0, y: 0 },
  settings: {},
  ...overrides,
})

const makeNode = (overrides: Partial<WorkflowNode> = {}): WorkflowNode => ({
  id: 'node-1',
  type: 'llm',
  label: 'GPT-4o 호출',
  description: 'LLM 모델을 호출합니다',
  status: 'idle',
  config: {},
  position: { x: 100, y: 100 },
  ...overrides,
})

describe('WidgetCard', () => {
  it('should render widget title', () => {
    render(
      <WidgetCard widget={makeWidget()}>
        <div>Content</div>
      </WidgetCard>,
    )
    expect(screen.getByText('Active Users')).toBeDefined()
  })

  it('should render children', () => {
    render(
      <WidgetCard widget={makeWidget()}>
        <span>Widget Content</span>
      </WidgetCard>,
    )
    expect(screen.getByText('Widget Content')).toBeDefined()
  })

  it('should show size label', () => {
    render(
      <WidgetCard widget={makeWidget({ size: 'lg' })}>
        <div />
      </WidgetCard>,
    )
    expect(screen.getByText('L')).toBeDefined()
  })

  it('should show hidden badge when not visible', () => {
    render(
      <WidgetCard widget={makeWidget({ visible: false })}>
        <div />
      </WidgetCard>,
    )
    expect(screen.getByText('숨김')).toBeDefined()
  })

  it('should show editing controls when editing', () => {
    const onRemove = vi.fn()
    render(
      <WidgetCard widget={makeWidget()} editing onRemove={onRemove}>
        <div />
      </WidgetCard>,
    )
    expect(screen.getByTitle('삭제')).toBeDefined()
    expect(screen.getByTitle('사이즈 변경')).toBeDefined()
  })

  it('should not show editing controls by default', () => {
    render(
      <WidgetCard widget={makeWidget()}>
        <div />
      </WidgetCard>,
    )
    expect(screen.queryByTitle('삭제')).toBeNull()
  })

  it('should call onRemove when delete clicked', () => {
    const onRemove = vi.fn()
    render(
      <WidgetCard widget={makeWidget()} editing onRemove={onRemove}>
        <div />
      </WidgetCard>,
    )
    fireEvent.click(screen.getByTitle('삭제'))
    expect(onRemove).toHaveBeenCalledWith('widget-1')
  })

  it('should call onToggle when visibility toggled', () => {
    const onToggle = vi.fn()
    render(
      <WidgetCard widget={makeWidget()} editing onToggle={onToggle}>
        <div />
      </WidgetCard>,
    )
    const toggleBtn = screen.getByTitle('숨기기')
    fireEvent.click(toggleBtn)
    expect(onToggle).toHaveBeenCalledWith('widget-1')
  })
})

describe('WorkflowNodeCard', () => {
  it('should render node label', () => {
    render(<WorkflowNodeCard node={makeNode()} />)
    expect(screen.getByText('GPT-4o 호출')).toBeDefined()
  })

  it('should render node description', () => {
    render(<WorkflowNodeCard node={makeNode()} />)
    expect(screen.getByText('LLM 모델을 호출합니다')).toBeDefined()
  })

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn()
    render(<WorkflowNodeCard node={makeNode()} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith('node-1')
  })

  it('should call onSelect on Enter key', () => {
    const onSelect = vi.fn()
    render(<WorkflowNodeCard node={makeNode()} onSelect={onSelect} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('node-1')
  })

  it('should show delete button when onDelete provided', () => {
    const onDelete = vi.fn()
    render(<WorkflowNodeCard node={makeNode()} onDelete={onDelete} />)
    const deleteBtn = screen.getByTitle('삭제')
    expect(deleteBtn).toBeDefined()

    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledWith('node-1')
  })

  it('should not show delete button without onDelete', () => {
    render(<WorkflowNodeCard node={makeNode()} />)
    expect(screen.queryByTitle('삭제')).toBeNull()
  })

  it('should show status indicator with title', () => {
    const { container } = render(<WorkflowNodeCard node={makeNode()} />)
    const statusDot = container.querySelector('[title="대기"]')
    expect(statusDot).toBeDefined()
  })

  it('should show running status text', () => {
    render(<WorkflowNodeCard node={makeNode({ status: 'running' })} />)
    expect(screen.getByText('실행 중')).toBeDefined()
  })

  it('should show error status text', () => {
    render(<WorkflowNodeCard node={makeNode({ status: 'error' })} />)
    expect(screen.getByText('오류')).toBeDefined()
  })

  it('should apply selected ring style', () => {
    const { container } = render(<WorkflowNodeCard node={makeNode()} selected />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('ring-2')
  })

  it('should render connection points', () => {
    const { container } = render(<WorkflowNodeCard node={makeNode()} />)
    const connectionPoints = container.querySelectorAll('.absolute.rounded-full')
    expect(connectionPoints.length).toBeGreaterThanOrEqual(2)
  })
})
