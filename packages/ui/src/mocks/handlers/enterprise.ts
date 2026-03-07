import { http, HttpResponse } from 'msw'

export const enterpriseHandlers = [
  // Tenants
  http.get('/api/admin/tenants', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'hyundai',
          name: '현대자동차',
          domain: 'hyundai.com',
          status: 'active',
          userCount: 1200,
        },
        { id: 'kia', name: '기아', domain: 'kia.com', status: 'active', userCount: 800 },
        {
          id: 'genesis',
          name: '제네시스',
          domain: 'genesis.com',
          status: 'active',
          userCount: 350,
        },
      ],
    })
  }),

  // Marketplace
  http.get('/api/admin/marketplace/agents', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'agent-1',
          name: '문서 요약 에이전트',
          category: '생산성',
          rating: 4.5,
          installs: 234,
          status: 'published',
        },
        {
          id: 'agent-2',
          name: '코드 리뷰 에이전트',
          category: '개발',
          rating: 4.8,
          installs: 567,
          status: 'published',
        },
      ],
    })
  }),

  // RBAC
  http.get('/api/admin/roles', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'admin', name: '관리자', permissions: ['all'], userCount: 3 },
        { id: 'manager', name: '매니저', permissions: ['read', 'write'], userCount: 12 },
        { id: 'user', name: '사용자', permissions: ['read'], userCount: 150 },
      ],
    })
  }),

  http.get('/api/admin/permissions', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'admin.read', name: '관리자 읽기', group: 'admin' },
        { id: 'admin.write', name: '관리자 쓰기', group: 'admin' },
        { id: 'chat.send', name: '채팅 전송', group: 'chat' },
      ],
    })
  }),

  // SSO
  http.get('/api/admin/sso/connections', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'okta-1', provider: 'Okta', status: 'active', domain: 'hyundai.com' },
        { id: 'azure-1', provider: 'Azure AD', status: 'active', domain: 'kia.com' },
      ],
    })
  }),

  http.post('/api/admin/sso/test', () => {
    return HttpResponse.json({ success: true, data: { valid: true, message: 'SSO 연결 성공' } })
  }),
]
