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
    default: 'H Chat LLM Router',
    template: '%s | H Chat LLM Router',
  },
  description: '현대자동차그룹 LLM 라우터 - 86개 AI 모델 통합 API, 최적 가격, 실시간 모니터링',
  keywords: ['LLM', 'AI', 'API', '라우터', '현대자동차그룹', 'GPT', 'Claude', 'Gemini'],
  openGraph: {
    title: 'H Chat LLM Router',
    description: '86개 AI 모델을 하나의 API로. 최적 비용, 실시간 모니터링.',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://hchat-llm-router.vercel.app',
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
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-lr-primary focus:text-white focus:rounded">본문 바로가기</a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
