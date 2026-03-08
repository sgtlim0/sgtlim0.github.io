'use client'

import type { ReactNode } from 'react'
import ThemeProvider from './ThemeProvider'

export interface BaseLayoutProps {
  readonly children: ReactNode
  readonly fontVariable: string
  readonly className?: string
  readonly lang?: string
  readonly head?: ReactNode
}

export default function BaseLayout({
  children,
  fontVariable,
  className,
  lang = 'ko',
  head,
}: BaseLayoutProps) {
  return (
    <html lang={lang} suppressHydrationWarning>
      {head && <head>{head}</head>}
      <body className={className ? `${fontVariable} ${className}` : fontVariable}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
