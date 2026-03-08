import type { NextConfig } from 'next'

// Static Export limitation: headers() in next.config.ts does not execute at runtime
// for static exports. These headers serve as documentation and are applied when
// served behind a reverse proxy (e.g., Nginx, Cloudflare) that reads next.config.ts.
// For GitHub Pages, CSP must be configured via hosting-level headers or <meta> tags.
// Nonce-based CSP is not possible without a server — unsafe-inline is retained for scripts.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:; worker-src 'self'; frame-ancestors 'none';",
  },
]

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
