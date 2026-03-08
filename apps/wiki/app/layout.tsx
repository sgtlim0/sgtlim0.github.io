import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { BaseLayout } from '@hchat/ui'
import Sidebar from '@/components/Sidebar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'H Chat Wiki',
    template: '%s | H Chat Wiki',
  },
  description: '현대차그룹 생성형 AI 서비스 H Chat 사용 가이드 - 채팅, 도구, 브라우저, 데스크톱 기능 안내',
  keywords: ['H Chat', '현대자동차그룹', 'AI', '위키', '사용 가이드', '생성형 AI'],
  openGraph: {
    title: 'H Chat Wiki',
    description: '현대차그룹 생성형 AI 서비스 H Chat 사용 가이드',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://sgtlim0.github.io',
    siteName: 'H Chat Wiki',
  },
  twitter: {
    card: 'summary',
    title: 'H Chat Wiki',
    description: '현대차그룹 생성형 AI 서비스 H Chat 사용 가이드',
  },
  alternates: {
    canonical: 'https://sgtlim0.github.io',
  },
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
    <BaseLayout
      fontVariable={inter.variable}
      className="antialiased font-sans"
      head={securityHeaders}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded"
      >
        본문 바로가기
      </a>
      <Sidebar />
      <main id="main-content" className="ml-[280px] h-screen overflow-hidden">
        {children}
      </main>
    </BaseLayout>
  )
}
