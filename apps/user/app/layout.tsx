import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@hchat/ui'
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
      <body className={inter.variable}>
        <ThemeProvider>
          <UserNavWrapper />
          <main className="min-h-[calc(100vh-80px)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
