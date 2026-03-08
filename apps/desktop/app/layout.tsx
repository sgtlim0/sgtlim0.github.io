import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@hchat/ui'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'H Chat Desktop',
    template: '%s | H Chat Desktop',
  },
  description: 'AI 데스크톱 채팅 애플리케이션 - 멀티 에이전트, 스웜, 토론, AI 도구',
  keywords: ['H Chat', 'Desktop', 'AI', '에이전트', '스웜', '토론'],
  openGraph: {
    title: 'H Chat Desktop',
    description: 'AI 데스크톱 채팅 애플리케이션',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://hchat-desktop.vercel.app',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
        />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={inter.variable}>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-dt-primary focus:text-white focus:rounded"
          >
            본문 바로가기
          </a>
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
