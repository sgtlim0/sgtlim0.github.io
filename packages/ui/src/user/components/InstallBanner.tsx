'use client'

import { usePWAInstall } from '../../hooks/usePWAInstall'

export interface InstallBannerProps {
  className?: string
}

export default function InstallBanner({ className }: InstallBannerProps) {
  const { canInstall, install } = usePWAInstall()

  if (!canInstall) return null

  return (
    <div
      className={`bg-[var(--user-primary)] text-white px-4 py-2 flex items-center justify-between text-sm flex-shrink-0 ${className ?? ''}`}
    >
      <span className="text-xs">H Chat을 홈 화면에 추가하세요</span>
      <button
        onClick={install}
        className="bg-white text-[var(--user-primary)] px-3 py-1 rounded-full text-xs font-semibold hover:bg-white/90 transition-colors"
      >
        설치
      </button>
    </div>
  )
}
