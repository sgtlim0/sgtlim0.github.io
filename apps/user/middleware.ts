import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Nonce-based CSP: eliminates unsafe-inline for scripts
  // - script-src: nonce + strict-dynamic (no unsafe-inline, no unsafe-eval)
  // - style-src: unsafe-inline retained — Tailwind CSS 4 requires runtime style injection
  // - connect-src: self + https for SSE streaming and API calls
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "worker-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', cspHeader)

  // Cache headers and API versioning based on request path
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'private, no-cache')

    // API version detection: versioned vs legacy endpoints
    if (pathname.startsWith('/api/v1/')) {
      response.headers.set('X-API-Version', 'v1')
    } else if (pathname.startsWith('/api/') && !pathname.startsWith('/api/lib/')) {
      // Legacy unversioned endpoint — add deprecation hints
      response.headers.set('X-API-Version', 'v1')
      response.headers.set('Deprecation', 'true')
      response.headers.set(
        'Link',
        `</api/v1${pathname.slice(4)}>; rel="successor-version"`,
      )
    }
  } else {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, must-revalidate',
    )
  }

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
