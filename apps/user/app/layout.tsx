import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { BaseLayout } from '@hchat/ui'
import UserNavWrapper from '@/components/UserNavWrapper'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'H Chat',
    template: '%s | H Chat',
  },
  description: '현대자동차그룹 H Chat AI 비서 플랫폼 - 업무 비서, 문서 번역, 문서 작성, 텍스트 추출',
  keywords: ['H Chat', '현대자동차그룹', 'AI', '업무 비서', '문서 번역', '문서 작성', 'OCR'],
  openGraph: {
    title: 'H Chat',
    description: '현대자동차그룹 H Chat AI 비서 플랫폼',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://hchat-user.vercel.app',
    siteName: 'H Chat',
  },
  twitter: {
    card: 'summary',
    title: 'H Chat',
    description: '현대자동차그룹 H Chat AI 비서 플랫폼',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'H Chat',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f6ef7',
  viewportFit: 'cover' as const,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <BaseLayout fontVariable={inter.variable}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-user-primary focus:text-white focus:rounded">본문 바로가기</a>
      <UserNavWrapper />
      <main id="main-content" className="min-h-[calc(100vh-80px)]">{children}</main>
      <Script id="sw-register" strategy="lazyOnload">
        {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js') }`}
      </Script>
    </BaseLayout>
  )
}
