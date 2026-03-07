import { http, HttpResponse } from 'msw'

export const chatHandlers = [
  http.post('/api/chat/send', async ({ request }) => {
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
  }),

  http.get('/api/chat/history', () => {
    return HttpResponse.json({ success: true, data: [] })
  }),

  http.get('/api/assistants', () => {
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
  }),

  http.get('/api/mobile/chats', () => {
    return HttpResponse.json({ success: true, data: [] })
  }),
]
