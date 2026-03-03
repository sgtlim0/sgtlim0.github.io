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
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
