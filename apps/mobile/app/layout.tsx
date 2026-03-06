import type { Metadata, Viewport } from 'next'
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'H Chat',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
        </ThemeProvider>
      </body>
    </html>
  )
}
