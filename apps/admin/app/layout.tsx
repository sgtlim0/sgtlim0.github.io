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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={inter.variable}>
        <ThemeProvider>
          <AdminNav />
          <main className="min-h-[calc(100vh-80px)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
