import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { BaseLayout } from '@hchat/ui'
import { AuthProvider } from '@hchat/ui/admin/auth'
import AdminNav from '@/components/AdminNav'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'H Chat Admin',
    template: '%s | H Chat Admin',
  },
  description: '현대자동차그룹 H Chat 관리자 패널 - AI 생산성 대시보드, 사용 현황, ROI 분석, 사용자 관리',
  keywords: ['H Chat', '현대자동차그룹', 'AI', '생산성', '관리자', 'ROI', '대시보드'],
  openGraph: {
    title: 'H Chat Admin',
    description: '현대자동차그룹 H Chat AI 생산성 관리 플랫폼',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://hchat-admin.vercel.app',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

const adminHead = (
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
  />
)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <BaseLayout fontVariable={inter.variable} head={adminHead}>
      <AuthProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-admin-primary focus:text-white focus:rounded">본문 바로가기</a>
        <AdminNav />
        <main id="main-content" className="min-h-[calc(100vh-80px)]">{children}</main>
      </AuthProvider>
    </BaseLayout>
  )
}
