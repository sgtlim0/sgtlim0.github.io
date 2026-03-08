import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { BaseLayout } from '@hchat/ui'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'H Chat Mobile',
    template: '%s | H Chat Mobile',
  },
  description: 'AI 모바일 채팅 애플리케이션 - 언제 어디서나 AI와 대화',
  keywords: ['H Chat', 'Mobile', 'AI', '채팅', '모바일'],
  openGraph: {
    title: 'H Chat Mobile',
    description: 'AI 모바일 채팅 애플리케이션',
    type: 'website',
    locale: 'ko_KR',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'H Chat',
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

const securityHeaders = (
  <>
    <meta
      httpEquiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    />
    <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
    <meta httpEquiv="X-Frame-Options" content="DENY" />
    <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
  </>
)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <BaseLayout fontVariable={inter.variable} head={securityHeaders}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-mb-primary focus:text-white focus:rounded"
      >
        본문 바로가기
      </a>
      <div
        id="main-content"
        className="min-h-screen max-w-[480px] mx-auto safe-area-top safe-area-bottom"
      >
        {children}
      </div>
      <Script id="sw-register" strategy="lazyOnload">
        {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js') }`}
      </Script>
    </BaseLayout>
  )
}
