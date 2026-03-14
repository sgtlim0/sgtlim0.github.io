import React, { useState, useCallback } from 'react'
import { ThemeProvider } from '@hchat/ui'
import { ConversationList, ChatView } from './components'
import type { Conversation, Message } from './components'

// Mock data for development
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: '웹 페이지 요약',
    timestamp: Date.now() - 1000 * 60 * 5,
    preview: '이 페이지는 React 19의 새로운 기능에 대해 설명합니다...',
    mode: 'summarize',
  },
  {
    id: '2',
    title: 'TypeScript 타입 설명',
    timestamp: Date.now() - 1000 * 60 * 30,
    preview: 'TypeScript의 제네릭 타입에 대한 자세한 설명입니다...',
    mode: 'explain',
  },
  {
    id: '3',
    title: 'AI 트렌드 조사',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    preview: '2024년 AI 산업의 주요 트렌드를 조사했습니다...',
    mode: 'research',
  },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      role: 'user',
      content: '이 페이지를 요약해줘',
      timestamp: Date.now() - 1000 * 60 * 5,
    },
    {
      id: 'm2',
      role: 'assistant',
      content:
        'React 19는 다음과 같은 주요 기능을 포함합니다:\n\n1. Actions - 폼 제출을 위한 새로운 API\n2. Document Metadata - 컴포넌트에서 직접 메타데이터 관리\n3. Asset Loading - 이미지와 스타일시트의 백그라운드 로딩\n4. Web Components 지원 개선\n\n이러한 기능들은 개발자 경험을 크게 향상시키고 성능을 최적화합니다.',
      timestamp: Date.now() - 1000 * 60 * 5 + 3000,
    },
  ],
  '2': [
    {
      id: 'm3',
      role: 'user',
      content: 'TypeScript 제네릭이 뭔지 설명해줘',
      timestamp: Date.now() - 1000 * 60 * 30,
    },
    {
      id: 'm4',
      role: 'assistant',
      content:
        'TypeScript 제네릭(Generics)은 타입을 파라미터화하여 재사용 가능한 컴포넌트를 만드는 기능입니다.\n\n예를 들어:\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg\n}\n```\n\n여기서 <T>는 타입 변수로, 함수를 호출할 때 실제 타입이 결정됩니다. 이를 통해 타입 안전성을 유지하면서도 유연한 코드를 작성할 수 있습니다.',
      timestamp: Date.now() - 1000 * 60 * 30 + 5000,
    },
  ],
  '3': [],
}

export function SidePanel() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string | null>('1')
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  const handleNewConversation = useCallback(() => {
    const newId = `conv-${Date.now()}`
    const newConv: Conversation = {
      id: newId,
      title: '새 대화',
      timestamp: Date.now(),
      preview: '아직 메시지가 없습니다.',
      mode: 'summarize',
    }
    setConversations((prev) => [newConv, ...prev])
    setMessages((prev) => ({ ...prev, [newId]: [] }))
    setActiveId(newId)
  }, [])

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setMessages((prev) => {
      const newMessages = { ...prev }
      delete newMessages[id]
      return newMessages
    })
    setActiveId((prev) => (prev === id ? null : prev))
  }, [])

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeId) return

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
      }

      setMessages((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), userMessage],
      }))

      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, preview: content, timestamp: Date.now() } : c,
        ),
      )

      // Simulate streaming response
      setIsStreaming(true)
      const mockResponse = `이것은 "${content}"에 대한 Mock 응답입니다. 실제로는 API를 호출하여 스트리밍 응답을 받게 됩니다.`

      let currentContent = ''
      const words = mockResponse.split(' ')

      for (let i = 0; i < words.length; i++) {
        currentContent += (i > 0 ? ' ' : '') + words[i]
        setStreamingContent(currentContent)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: mockResponse,
        timestamp: Date.now(),
      }

      setMessages((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), assistantMessage],
      }))

      setIsStreaming(false)
      setStreamingContent('')
    },
    [activeId],
  )

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
    // TODO: Show toast notification
  }, [])

  const activeMessages = activeId ? messages[activeId] || [] : []

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-ext-bg text-ext-text">
        <div className="w-80 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={setActiveId}
            onDelete={handleDeleteConversation}
            onNew={handleNewConversation}
          />
        </div>
        <div className="flex-1 min-w-0">
          <ChatView
            conversationId={activeId}
            messages={activeMessages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            onSendMessage={handleSendMessage}
            onCopy={handleCopyMessage}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}
