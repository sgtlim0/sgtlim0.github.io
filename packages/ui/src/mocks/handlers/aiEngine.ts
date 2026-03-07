import { http, HttpResponse } from 'msw'

export const aiEngineHandlers = [
  // Analytics
  http.get('/api/admin/analytics', () => {
    return HttpResponse.json({
      success: true,
      data: { anomalies: [], predictions: [], insights: [] },
    })
  }),

  // RAG
  http.get('/api/admin/rag/search', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') ?? ''
    return HttpResponse.json({
      success: true,
      data: {
        results: [
          {
            id: 'doc-1',
            title: 'H Chat 사용 가이드',
            score: 0.95,
            snippet: `"${query}" 관련 내용...`,
          },
        ],
        total: 1,
      },
    })
  }),

  http.get('/api/admin/rag/documents', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'doc-1', title: 'H Chat 사용 가이드', chunks: 7, status: 'indexed' },
        { id: 'doc-2', title: 'API 레퍼런스', chunks: 12, status: 'indexed' },
      ],
    })
  }),

  // Prompt Versions
  http.get('/api/admin/prompts/versions', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'pv-1', name: '기본 시스템 프롬프트', version: 3, status: 'active' },
        { id: 'pv-2', name: '코드 리뷰 프롬프트', version: 2, status: 'active' },
      ],
    })
  }),

  http.get('/api/admin/prompts/ab-tests', () => {
    return HttpResponse.json({ success: true, data: [] })
  }),

  // Benchmarks
  http.get('/api/admin/benchmarks', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { model: 'claude-3.5-sonnet', accuracy: 94.2, latency: 230, cost: 3.0 },
        { model: 'gpt-4o', accuracy: 92.8, latency: 280, cost: 5.0 },
      ],
    })
  }),
]
