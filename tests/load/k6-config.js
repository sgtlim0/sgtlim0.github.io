import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 50 }, // Hold at 50 users
    { duration: '30s', target: 100 }, // Peak at 100 users
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95th percentile under 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% error rate
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3003'

export default function () {
  // Health check
  const health = http.get(`${BASE_URL}/api/health`)
  check(health, {
    'health returns 200': (r) => r.status === 200,
  })

  // Chat API
  const chatPayload = JSON.stringify({
    message: 'Hello, H Chat!',
    history: [],
  })
  const chat = http.post(`${BASE_URL}/api/chat`, chatPayload, {
    headers: { 'Content-Type': 'application/json' },
  })
  check(chat, {
    'chat returns 200': (r) => r.status === 200,
  })

  // Analyze API
  const analyzePayload = JSON.stringify({
    text: 'Sample text for analysis',
    mode: 'summarize',
  })
  const analyze = http.post(`${BASE_URL}/api/analyze`, analyzePayload, {
    headers: { 'Content-Type': 'application/json' },
  })
  check(analyze, {
    'analyze returns 200': (r) => r.status === 200,
  })

  sleep(1)
}
