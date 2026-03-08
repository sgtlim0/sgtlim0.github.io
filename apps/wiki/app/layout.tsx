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
  title: 'H Chat Wiki',
  description: '현대차그룹 생성형 AI 서비스 H Chat 사용 가이드',
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
