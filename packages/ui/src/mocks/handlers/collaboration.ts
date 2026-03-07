import { http, HttpResponse } from 'msw'

export const collaborationHandlers = [
  // Alert Rules
  http.get('/api/admin/alert-rules', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'rule-1',
          name: '높은 에러율 알림',
          condition: 'error_rate > 5%',
          channels: ['slack'],
          enabled: true,
        },
        {
          id: 'rule-2',
          name: '비용 초과 알림',
          condition: 'daily_cost > 100000',
          channels: ['email'],
          enabled: true,
        },
      ],
    })
  }),

  // Team Chat
  http.get('/api/admin/rooms', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'room-1',
          name: '개발팀',
          memberCount: 12,
          lastMessage: '배포 완료!',
          updatedAt: '2026-03-07T10:00:00Z',
        },
        {
          id: 'room-2',
          name: 'AI 연구',
          memberCount: 8,
          lastMessage: '새 모델 테스트',
          updatedAt: '2026-03-07T09:30:00Z',
        },
      ],
    })
  }),

  http.get('/api/admin/messages', ({ request }) => {
    const url = new URL(request.url)
    const roomId = url.searchParams.get('roomId')
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'msg-1',
          roomId,
          content: '안녕하세요!',
          sender: 'user01',
          timestamp: '2026-03-07T10:00:00Z',
        },
      ],
    })
  }),
]
