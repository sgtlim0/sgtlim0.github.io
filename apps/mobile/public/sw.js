// H Chat Mobile Service Worker v1
// Cache strategies: Cache First (static), Network First (API), Stale While Revalidate (HTML)

const CACHE_VERSION = 'hchat-mobile-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const MAX_DYNAMIC_CACHE_SIZE = 50

const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
]

// --- Install: precache critical assets ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// --- Activate: purge old caches ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// --- Helpers ---
function isStaticAsset(url) {
  return /\.(css|js|woff2?|ttf|eot|png|jpe?g|gif|svg|ico|webp)(\?.*)?$/.test(url.pathname)
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/')
}

function isHMR(url) {
  return url.pathname.startsWith('/_next/webpack-hmr')
}

function isSSE(request) {
  return request.headers.get('Accept') === 'text/event-stream'
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxItems) {
    await cache.delete(keys[0])
    await trimCache(cacheName, maxItems)
  }
}

// --- Cache First: static assets (CSS, JS, images, fonts) ---
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 503 })
  }
}

// --- Network First: API calls ---
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    return response
  } catch {
    return new Response(
      JSON.stringify({ error: 'Offline. Please check your network connection.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// --- Stale While Revalidate: HTML pages ---
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok && request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE)
        cache.put(request, response.clone())
        await trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE)
      }
      return response
    })
    .catch(() => null)

  if (cached) {
    fetchPromise.catch(() => {})
    return cached
  }

  const networkResponse = await fetchPromise
  if (networkResponse) return networkResponse

  // Offline fallback
  const offlinePage = await caches.match('/offline.html')
  return offlinePage || new Response('Offline', { status: 503 })
}

// --- Push notification handler ---
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'H Chat', body: '새 알림' }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: data.url ? { url: data.url } : undefined,
    })
  )
})

// --- Notification click handler ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url === url)
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})

// --- Fetch handler ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip HMR (dev only)
  if (isHMR(url)) return

  // Skip SSE streaming
  if (isSSE(event.request)) return

  // API: Network First
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request))
    return
  }

  // Static assets: Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // HTML pages: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(event.request))
})
