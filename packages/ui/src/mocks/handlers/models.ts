import { http, HttpResponse } from 'msw'

export const modelHandlers = [
  http.get('/api/models', ({ request }) => {
    const url = new URL(request.url)
    const provider = url.searchParams.get('provider')

    const models = [
      {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        inputPrice: 3,
        outputPrice: 15,
        contextWindow: 200000,
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        inputPrice: 5,
        outputPrice: 15,
        contextWindow: 128000,
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'Google',
        inputPrice: 0.5,
        outputPrice: 1.5,
        contextWindow: 1000000,
      },
    ]

    const filtered = provider ? models.filter((m) => m.provider === provider) : models
    return HttpResponse.json({ success: true, data: filtered })
  }),

  http.get('/api/models/:id/stream', () => {
    return new HttpResponse('data: {"token":"Hello"}\n\ndata: [DONE]\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }),

  http.get('/api/keys', () => {
    return HttpResponse.json({
      success: true,
      data: [{ id: 'key_1', name: 'Default Key', prefix: 'hc-****', createdAt: '2026-01-01' }],
    })
  }),
]
