import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock useStreamingChat
const mockStartStream = vi.fn()
const mockStopStream = vi.fn()
const mockReset = vi.fn()

vi.mock('../src/llm-router/services/streamingHooks', () => ({
  useStreamingChat: vi.fn(() => ({
    isStreaming: false,
    streamingContent: '',
    result: null,
    error: null,
    startStream: mockStartStream,
    stopStream: mockStopStream,
    reset: mockReset,
  })),
}))

import StreamingPlayground from '../src/llm-router/StreamingPlayground'
import { useStreamingChat } from '../src/llm-router/services/streamingHooks'

const mockUseStreamingChat = useStreamingChat as ReturnType<typeof vi.fn>

describe('StreamingPlayground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseStreamingChat.mockReturnValue({
      isStreaming: false,
      streamingContent: '',
      result: null,
      error: null,
      startStream: mockStartStream,
      stopStream: mockStopStream,
      reset: mockReset,
    })
  })

  it('renders heading', () => {
    render(<StreamingPlayground />)
    expect(screen.getByText('Playground')).toBeInTheDocument()
  })

  it('renders model selector', () => {
    render(<StreamingPlayground />)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('renders Clear button', () => {
    render(<StreamingPlayground />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('renders Parameters toggle', () => {
    render(<StreamingPlayground />)
    expect(screen.getByText('Parameters')).toBeInTheDocument()
  })

  it('renders empty state message', () => {
    render(<StreamingPlayground />)
    expect(screen.getByText('Send a message to start the conversation.')).toBeInTheDocument()
  })

  it('renders Send button', () => {
    render(<StreamingPlayground />)
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('renders system prompt textarea', () => {
    render(<StreamingPlayground />)
    expect(screen.getByPlaceholderText('System prompt (optional)')).toBeInTheDocument()
  })

  it('renders user input textarea', () => {
    render(<StreamingPlayground />)
    expect(
      screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)'),
    ).toBeInTheDocument()
  })

  it('toggles Parameters panel', async () => {
    render(<StreamingPlayground />)
    const paramBtn = screen.getByText('Parameters')

    // Initially closed: [+] indicator visible
    expect(screen.getByText('[+]')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(paramBtn)
    })

    // Now open: [-] indicator visible
    expect(screen.getByText('[-]')).toBeInTheDocument()
    // Temperature label should appear
    expect(screen.getByText(/Temperature/)).toBeInTheDocument()
  })

  it('shows parameters sliders when config is open', async () => {
    render(<StreamingPlayground />)
    const paramBtn = screen.getByText('Parameters')

    await act(async () => {
      fireEvent.click(paramBtn)
    })

    expect(screen.getByText(/Temperature/)).toBeInTheDocument()
    expect(screen.getByText(/Max Tokens/)).toBeInTheDocument()
    expect(screen.getByText(/Top P/)).toBeInTheDocument()
  })

  it('Send button is disabled when input is empty', () => {
    render(<StreamingPlayground />)
    const sendBtn = screen.getByText('Send')
    expect(sendBtn).toBeDisabled()
  })

  it('calls startStream when Send is clicked with input', async () => {
    render(<StreamingPlayground />)
    const input = screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello AI' } })
    })

    const sendBtn = screen.getByText('Send')
    await act(async () => {
      fireEvent.click(sendBtn)
    })

    expect(mockStartStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'Hello AI' }),
        ]),
      }),
    )
  })

  it('clears input after sending', async () => {
    render(<StreamingPlayground />)
    const input = screen.getByPlaceholderText(
      'Type a message... (Shift+Enter for new line)',
    ) as HTMLTextAreaElement

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello' } })
    })

    const sendBtn = screen.getByText('Send')
    await act(async () => {
      fireEvent.click(sendBtn)
    })

    expect(input.value).toBe('')
  })

  it('calls reset when Clear is clicked', async () => {
    render(<StreamingPlayground />)
    const clearBtn = screen.getByText('Clear')

    await act(async () => {
      fireEvent.click(clearBtn)
    })

    expect(mockReset).toHaveBeenCalled()
  })

  it('shows Stop button when streaming', () => {
    mockUseStreamingChat.mockReturnValue({
      isStreaming: true,
      streamingContent: 'Partial response...',
      result: null,
      error: null,
      startStream: mockStartStream,
      stopStream: mockStopStream,
      reset: mockReset,
    })

    render(<StreamingPlayground />)
    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.queryByText('Send')).not.toBeInTheDocument()
  })

  it('calls stopStream when Stop button is clicked', async () => {
    mockUseStreamingChat.mockReturnValue({
      isStreaming: true,
      streamingContent: 'Partial...',
      result: null,
      error: null,
      startStream: mockStartStream,
      stopStream: mockStopStream,
      reset: mockReset,
    })

    render(<StreamingPlayground />)
    const stopBtn = screen.getByText('Stop')

    await act(async () => {
      fireEvent.click(stopBtn)
    })

    expect(mockStopStream).toHaveBeenCalled()
  })

  it('displays streaming content', () => {
    mockUseStreamingChat.mockReturnValue({
      isStreaming: true,
      streamingContent: 'Hello from AI',
      result: null,
      error: null,
      startStream: mockStartStream,
      stopStream: mockStopStream,
      reset: mockReset,
    })

    render(<StreamingPlayground />)
    expect(screen.getByText('Hello from AI')).toBeInTheDocument()
  })

  it('displays error message', () => {
    mockUseStreamingChat.mockReturnValue({
      isStreaming: false,
      streamingContent: '',
      result: null,
      error: new Error('Something went wrong'),
      startStream: mockStartStream,
      stopStream: mockStopStream,
      reset: mockReset,
    })

    render(<StreamingPlayground />)
    expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument()
  })

  it('displays result stats after completion', () => {
    mockUseStreamingChat.mockReturnValue({
      isStreaming: false,
      streamingContent: '',
      result: {
        content: 'Response text',
        model: 'gpt-4o',
        inputTokens: 50,
        outputTokens: 100,
        totalTokens: 150,
        responseTimeMs: 1234,
        estimatedCostKRW: 5.5,
        finishReason: 'stop',
      },
      error: null,
      startStream: mockStartStream,
      stopStream: mockStopStream,
      reset: mockReset,
    })

    render(<StreamingPlayground />)
    expect(screen.getByText('Response Stats')).toBeInTheDocument()
    expect(screen.getByText('gpt-4o')).toBeInTheDocument()
    expect(screen.getByText('50 tok')).toBeInTheDocument()
    expect(screen.getByText('100 tok')).toBeInTheDocument()
    expect(screen.getByText('150 tok')).toBeInTheDocument()
    expect(screen.getByText('1,234 ms')).toBeInTheDocument()
    expect(screen.getByText('5.5 KRW')).toBeInTheDocument()
    expect(screen.getByText('stop')).toBeInTheDocument()
  })

  it('formats large costs with K suffix', () => {
    mockUseStreamingChat.mockReturnValue({
      isStreaming: false,
      streamingContent: '',
      result: {
        content: 'Response',
        model: 'gpt-4o',
        inputTokens: 50,
        outputTokens: 100,
        totalTokens: 150,
        responseTimeMs: 500,
        estimatedCostKRW: 2500,
        finishReason: 'stop',
      },
      error: null,
      startStream: mockStartStream,
      stopStream: mockStopStream,
      reset: mockReset,
    })

    render(<StreamingPlayground />)
    expect(screen.getByText('2.5K KRW')).toBeInTheDocument()
  })

  it('sends with Enter key (without Shift)', async () => {
    render(<StreamingPlayground />)
    const input = screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello' } })
    })

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })
    })

    expect(mockStartStream).toHaveBeenCalled()
  })

  it('does not send with Shift+Enter', async () => {
    render(<StreamingPlayground />)
    const input = screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello' } })
    })

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    })

    expect(mockStartStream).not.toHaveBeenCalled()
  })

  it('does not send empty message', async () => {
    render(<StreamingPlayground />)
    const input = screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)')

    await act(async () => {
      fireEvent.change(input, { target: { value: '   ' } })
    })

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })
    })

    expect(mockStartStream).not.toHaveBeenCalled()
  })

  it('does not send when already streaming', async () => {
    mockUseStreamingChat.mockReturnValue({
      isStreaming: true,
      streamingContent: 'streaming...',
      result: null,
      error: null,
      startStream: mockStartStream,
      stopStream: mockStopStream,
      reset: mockReset,
    })

    render(<StreamingPlayground />)
    const input = screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)')
    expect(input).toBeDisabled()
  })

  it('includes system prompt in messages when provided', async () => {
    render(<StreamingPlayground />)

    const sysInput = screen.getByPlaceholderText('System prompt (optional)')
    await act(async () => {
      fireEvent.change(sysInput, { target: { value: 'You are a helpful assistant' } })
    })

    const userInput = screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)')
    await act(async () => {
      fireEvent.change(userInput, { target: { value: 'Hello' } })
    })

    const sendBtn = screen.getByText('Send')
    await act(async () => {
      fireEvent.click(sendBtn)
    })

    expect(mockStartStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system', content: 'You are a helpful assistant' }),
        ]),
      }),
    )
  })

  it('changes model selection', async () => {
    render(<StreamingPlayground />)
    const selects = screen.getAllByRole('combobox')
    const modelSelect = selects[0]

    await act(async () => {
      fireEvent.change(modelSelect, { target: { value: 'gpt-3-5-turbo' } })
    })

    // Send a message to verify model is used
    const input = screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)')
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } })
    })
    const sendBtn = screen.getByText('Send')
    await act(async () => {
      fireEvent.click(sendBtn)
    })

    expect(mockStartStream).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-3-5-turbo',
      }),
    )
  })

  it('displays user messages in chat area', async () => {
    render(<StreamingPlayground />)
    const input = screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'My message' } })
    })

    const sendBtn = screen.getByText('Send')
    await act(async () => {
      fireEvent.click(sendBtn)
    })

    expect(screen.getByText('My message')).toBeInTheDocument()
    expect(screen.getByText('user')).toBeInTheDocument()
  })
})
