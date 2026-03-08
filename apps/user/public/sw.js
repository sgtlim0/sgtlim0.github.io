// H Chat Service Worker v1
const CACHE_NAME = 'hchat-v1'
const STATIC_ASSETS = ['/']

// 설치: 정적 자산 캐시
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// 활성화: 구버전 캐시 삭제
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

// fetch 가로채기 (3-tier 캐싱)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // 1. API 요청: 네트워크 전용, 실패 시 오프라인 메시지
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(
          JSON.stringify({ error: '오프라인 상태입니다. 네트워크 연결을 확인해 주세요.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )
    return
  }

  // 2. SSE 스트리밍: 네트워크 전용
  if (e.request.headers.get('Accept') === 'text/event-stream') {
    e.respondWith(fetch(e.request))
    return
  }

  // 3. Next.js HMR: 무시
  if (url.pathname.startsWith('/_next/webpack-hmr')) return

  // 4. 정적 자산: 캐시 우선 + 네트워크 폴백
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached

      return fetch(e.request)
        .then((res) => {
          if (res.ok && e.request.method === 'GET') {
            const resClone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone))
          }
          return res
        })
        .catch(() =>
          new Response('오프라인', { status: 503 })
        )
    })
  )
})
