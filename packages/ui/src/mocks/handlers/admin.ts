import { http, HttpResponse } from 'msw'

export const adminHandlers = [
  http.get('/api/admin/dashboard', () => {
    return HttpResponse.json({
      success: true,
      data: {
        stats: [
          { label: '총 대화 수', value: '1,247' },
          { label: '총 토큰 사용량', value: '2.4M' },
          { label: '활성 사용자', value: '38' },
          { label: '이번 달 비용', value: '₩127K' },
        ],
        modelUsage: [
          { label: 'Claude 3.5', value: 45, color: 'bg-admin-teal' },
          { label: 'GPT-4', value: 30, color: 'bg-admin-blue' },
        ],
      },
    })
  }),

  http.get('/api/admin/users', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'user01',
          name: '김개발',
          email: 'dev@hchat.ai',
          role: 'user',
          status: 'active',
          lastActive: '2026-03-07',
        },
        {
          id: 'user02',
          name: '이기획',
          email: 'plan@hchat.ai',
          role: 'user',
          status: 'active',
          lastActive: '2026-03-06',
        },
      ],
    })
  }),

  http.get('/api/admin/settings', () => {
    return HttpResponse.json({
      success: true,
      data: {
        defaultModel: 'claude-3.5-sonnet',
        maxTokens: 4096,
        theme: 'system',
        language: 'ko',
      },
    })
  }),

  http.put('/api/admin/settings', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ success: true, data: body })
  }),

  http.get('/api/admin/realtime/metrics', () => {
    return HttpResponse.json({
      success: true,
      data: { activeUsers: 38, requestsPerMinute: 142, avgLatency: 230, errorRate: 0.02 },
    })
  }),

  http.get('/api/admin/notifications', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          title: '시스템 업데이트',
          message: 'v2.1 배포 완료',
          type: 'info',
          read: false,
          createdAt: '2026-03-07T10:00:00Z',
        },
      ],
    })
  }),

  http.get('/api/admin/widgets/layout', () => {
    return HttpResponse.json({ success: true, data: { layout: [], widgets: [] } })
  }),

  http.get('/api/admin/workflows', () => {
    return HttpResponse.json({ success: true, data: [] })
  }),
]
