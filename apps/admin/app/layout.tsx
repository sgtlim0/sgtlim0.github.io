import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@hchat/ui'
import AdminNav from '@/components/AdminNav'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'H Chat Admin',
  description: 'H Chat 관리자 패널 - 사용 현황, 통계, 사용자 관리',
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
          <AdminNav />
          <main className="min-h-[calc(100vh-80px)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
