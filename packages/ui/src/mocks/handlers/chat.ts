import { http, HttpResponse } from 'msw'

function chatSendHandler() {
  return async ({ request }: { request: Request }) => {
    const body = (await request.json()) as { conversationId: string; content: string }
    return HttpResponse.json({
      success: true,
      data: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `이것은 "${body.content}"에 대한 Mock 응답입니다.`,
        timestamp: new Date().toISOString(),
      },
    })
  }
}

function chatHistoryHandler() {
  return () => {
    return HttpResponse.json({ success: true, data: [] })
  }
}

function assistantsHandler() {
  return () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'general',
          name: 'H Chat 어시스턴트',
          description: '범용 AI 어시스턴트',
          model: 'claude-3.5-sonnet',
          isOfficial: true,
        },
        {
          id: 'code',
          name: '코드 리뷰어',
          description: '코드 리뷰 전문 AI',
          model: 'claude-3.5-sonnet',
          isOfficial: true,
        },
      ],
    })
  }
}

export const chatHandlers = [
  // v1 versioned endpoints
  http.post('/api/v1/chat/send', chatSendHandler()),
  http.get('/api/v1/chat/history', chatHistoryHandler()),
  http.get('/api/v1/assistants', assistantsHandler()),

  // Legacy unversioned endpoints (backward compatibility)
  http.post('/api/chat/send', chatSendHandler()),
  http.get('/api/chat/history', chatHistoryHandler()),
  http.get('/api/assistants', assistantsHandler()),

  http.get('/api/mobile/chats', () => {
    return HttpResponse.json({ success: true, data: [] })
  }),
]
