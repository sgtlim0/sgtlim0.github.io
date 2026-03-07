import { http, HttpResponse } from 'msw'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    const users: Record<string, { id: string; name: string; role: string }> = {
      'admin@hchat.ai': { id: '1', name: '관리자', role: 'admin' },
      'manager@hchat.ai': { id: '2', name: '매니저', role: 'manager' },
      'viewer@hchat.ai': { id: '3', name: '뷰어', role: 'viewer' },
    }

    const user = users[body.email]
    if (!user) {
      return HttpResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    return HttpResponse.json({
      success: true,
      data: {
        token: `mock-jwt-${user.id}-${Date.now()}`,
        user: { ...user, email: body.email, organization: '현대자동차그룹' },
      },
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'admin@hchat.ai',
        name: '관리자',
        role: 'admin',
        organization: '현대자동차그룹',
      },
    })
  }),
]
