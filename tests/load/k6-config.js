import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------
const healthErrors = new Rate('health_errors')
const chatErrors = new Rate('chat_errors')
const streamErrors = new Rate('stream_errors')
const researchErrors = new Rate('research_errors')
const pageErrors = new Rate('page_errors')
const chatDuration = new Trend('chat_duration', true)
const streamDuration = new Trend('stream_duration', true)
const researchDuration = new Trend('research_duration', true)
const totalRequests = new Counter('total_requests')

// ---------------------------------------------------------------------------
// Environment config
// ---------------------------------------------------------------------------
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3003'
const WIKI_URL = __ENV.WIKI_URL || 'http://localhost:3000'
const ADMIN_URL = __ENV.ADMIN_URL || 'http://localhost:3002'
const LLM_ROUTER_URL = __ENV.LLM_ROUTER_URL || 'http://localhost:3004'

// ---------------------------------------------------------------------------
// Scenarios & thresholds
// ---------------------------------------------------------------------------
export const options = {
  scenarios: {
    // Scenario 1: Health check smoke test
    smoke_health: {
      executor: 'constant-vus',
      vus: 1,
      duration: '10s',
      exec: 'healthCheck',
      tags: { scenario: 'smoke_health' },
    },

    // Scenario 2: Chat API normal load
    chat_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '10s',
      exec: 'chatApi',
      tags: { scenario: 'chat_load' },
    },

    // Scenario 3: SSE streaming load
    stream_load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      startTime: '10s',
      exec: 'streamApi',
      tags: { scenario: 'stream_load' },
    },

    // Scenario 4: Research (heavy compute) load
    research_load: {
      executor: 'constant-vus',
      vus: 3,
      duration: '30s',
      startTime: '10s',
      exec: 'researchApi',
      tags: { scenario: 'research_load' },
    },

    // Scenario 5: Static pages load
    pages_load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      startTime: '10s',
      exec: 'staticPages',
      tags: { scenario: 'pages_load' },
    },

    // Scenario 6: Spike test
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 5 },
        { duration: '5s', target: 50 },
        { duration: '10s', target: 50 },
        { duration: '5s', target: 100 },
        { duration: '10s', target: 100 },
        { duration: '5s', target: 0 },
      ],
      startTime: '50s',
      exec: 'spikeTraffic',
      tags: { scenario: 'spike' },
    },
  },

  thresholds: {
    // Global thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>100'],

    // Per-scenario custom metrics
    health_errors: ['rate<0.001'],
    chat_errors: ['rate<0.02'],
    stream_errors: ['rate<0.05'],
    research_errors: ['rate<0.05'],
    page_errors: ['rate<0.01'],
    chat_duration: ['p(95)<800'],
    stream_duration: ['p(95)<2000'],
    research_duration: ['p(95)<3000'],
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const jsonHeaders = { headers: { 'Content-Type': 'application/json' } }

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const chatMessages = [
  'Hello, H Chat!',
  'Summarize this quarter report.',
  'Translate the following to English: 안녕하세요',
  'What are the key differences between GPT-4 and Claude?',
  'Help me write a Python script for data analysis.',
]

const researchQueries = [
  { text: 'Sample text for analysis', mode: 'summarize' },
  { text: 'Compare cloud providers for enterprise AI deployment', mode: 'research' },
  { text: 'Explain the ROI of generative AI in manufacturing', mode: 'analyze' },
]

// ---------------------------------------------------------------------------
// Scenario 1: Health check smoke test
// ---------------------------------------------------------------------------
export function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`)
  totalRequests.add(1)

  const passed = check(res, {
    'health: status 200': (r) => r.status === 200,
    'health: response time < 200ms': (r) => r.timings.duration < 200,
  })
  healthErrors.add(!passed)

  sleep(1)
}

// ---------------------------------------------------------------------------
// Scenario 2: Chat API normal load
// ---------------------------------------------------------------------------
export function chatApi() {
  const payload = JSON.stringify({
    message: randomItem(chatMessages),
    history: [],
  })

  const res = http.post(`${BASE_URL}/api/chat`, payload, jsonHeaders)
  totalRequests.add(1)
  chatDuration.add(res.timings.duration)

  const passed = check(res, {
    'chat: status 200': (r) => r.status === 200,
    'chat: has body': (r) => r.body && r.body.length > 0,
    'chat: response time < 1s': (r) => r.timings.duration < 1000,
  })
  chatErrors.add(!passed)

  sleep(0.5)
}

// ---------------------------------------------------------------------------
// Scenario 3: SSE streaming
//   k6 does not natively support EventSource / SSE push. We use a standard
//   HTTP request to the streaming endpoint. The response will contain the
//   full SSE payload once the connection closes (or hits the k6 timeout).
//   This validates that the endpoint is reachable and responds within limits.
// ---------------------------------------------------------------------------
export function streamApi() {
  const payload = JSON.stringify({
    message: randomItem(chatMessages),
    stream: true,
  })

  const params = {
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    timeout: '10s',
  }

  const res = http.post(`${BASE_URL}/api/chat/stream`, payload, params)
  totalRequests.add(1)
  streamDuration.add(res.timings.duration)

  const passed = check(res, {
    'stream: status 200': (r) => r.status === 200,
    'stream: content-type includes event-stream or json': (r) => {
      const ct = (r.headers['Content-Type'] || '').toLowerCase()
      return ct.includes('event-stream') || ct.includes('json')
    },
  })
  streamErrors.add(!passed)

  sleep(1)
}

// ---------------------------------------------------------------------------
// Scenario 4: Research (heavy compute)
// ---------------------------------------------------------------------------
export function researchApi() {
  const query = randomItem(researchQueries)
  const payload = JSON.stringify(query)

  const res = http.post(`${BASE_URL}/api/analyze`, payload, jsonHeaders)
  totalRequests.add(1)
  researchDuration.add(res.timings.duration)

  const passed = check(res, {
    'research: status 200': (r) => r.status === 200,
    'research: has body': (r) => r.body && r.body.length > 0,
    'research: response time < 5s': (r) => r.timings.duration < 5000,
  })
  researchErrors.add(!passed)

  sleep(2)
}

// ---------------------------------------------------------------------------
// Scenario 5: Static pages
// ---------------------------------------------------------------------------
export function staticPages() {
  group('Wiki homepage', () => {
    const res = http.get(WIKI_URL)
    totalRequests.add(1)
    const passed = check(res, {
      'wiki: status 200': (r) => r.status === 200,
      'wiki: response time < 500ms': (r) => r.timings.duration < 500,
    })
    pageErrors.add(!passed)
  })

  group('Admin dashboard', () => {
    const res = http.get(`${ADMIN_URL}/`)
    totalRequests.add(1)
    const passed = check(res, {
      'admin: status 200': (r) => r.status === 200,
      'admin: response time < 500ms': (r) => r.timings.duration < 500,
    })
    pageErrors.add(!passed)
  })

  group('LLM Router models', () => {
    const res = http.get(`${LLM_ROUTER_URL}/models`)
    totalRequests.add(1)
    const passed = check(res, {
      'llm-router: status 200': (r) => r.status === 200,
      'llm-router: response time < 500ms': (r) => r.timings.duration < 500,
    })
    pageErrors.add(!passed)
  })

  sleep(1)
}

// ---------------------------------------------------------------------------
// Scenario 6: Spike traffic — mixed requests
// ---------------------------------------------------------------------------
export function spikeTraffic() {
  // Health
  const health = http.get(`${BASE_URL}/api/health`)
  totalRequests.add(1)
  check(health, { 'spike-health: status 200': (r) => r.status === 200 })

  // Chat
  const chatPayload = JSON.stringify({
    message: randomItem(chatMessages),
    history: [],
  })
  const chat = http.post(`${BASE_URL}/api/chat`, chatPayload, jsonHeaders)
  totalRequests.add(1)
  chatDuration.add(chat.timings.duration)
  check(chat, { 'spike-chat: status 200': (r) => r.status === 200 })

  // Static page
  const page = http.get(WIKI_URL)
  totalRequests.add(1)
  check(page, { 'spike-wiki: status 200': (r) => r.status === 200 })

  sleep(0.3)
}
