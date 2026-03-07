import { http, HttpResponse } from 'msw'

export const aiAdvancedHandlers = [
  // Finetune
  http.get('/api/admin/finetune/jobs', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'ft-1',
          model: 'claude-3.5-sonnet',
          status: 'completed',
          epochs: 3,
          loss: 0.42,
          improvement: '+16.7%',
        },
      ],
    })
  }),

  http.get('/api/admin/finetune/datasets', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'ds-1',
          name: '고객 응대 데이터셋',
          records: 5000,
          format: 'jsonl',
          createdAt: '2026-02-15',
        },
      ],
    })
  }),

  // Charts
  http.get('/api/admin/charts', () => {
    return HttpResponse.json({ success: true, data: { treemap: [], sankey: [], scatter: [] } })
  }),

  // Knowledge Graph
  http.get('/api/admin/knowledge-graph', () => {
    return HttpResponse.json({
      success: true,
      data: {
        nodes: [
          { id: 'n1', label: 'H Chat', type: 'product' },
          { id: 'n2', label: 'Claude', type: 'model' },
        ],
        edges: [{ source: 'n1', target: 'n2', label: 'uses' }],
      },
    })
  }),

  // Voice
  http.post('/api/admin/voice/stt', () => {
    return HttpResponse.json({
      success: true,
      data: { text: '음성 인식 결과 텍스트', confidence: 0.95, language: 'ko' },
    })
  }),

  http.post('/api/admin/voice/tts', () => {
    return HttpResponse.json({
      success: true,
      data: { audioUrl: '/mock-audio.mp3', duration: 3.2 },
    })
  }),
]
