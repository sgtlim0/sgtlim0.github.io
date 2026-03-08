import React from 'react'

/**
 * HMG domain stat card component
 * Related components:
 * - Admin domain: packages/ui/src/admin/StatCard.tsx
 * - ROI domain: packages/ui/src/roi/KPICard.tsx
 *
 * Each uses domain-specific CSS variables (hmg-*, admin-*, roi-*)
 * for consistent theming within their respective domains.
 */
interface HmgStatCardProps {
  label: string
  value: string | number
}

export default function HmgStatCard({ label, value }: HmgStatCardProps) {
  return (
    <div className="w-[200px] h-[120px] flex-1 flex flex-col items-center justify-center bg-hmg-bg-section rounded-lg p-5 gap-2">
      <span className="text-[13px] text-hmg-text-caption">{label}</span>
      <span className="text-[32px] font-bold text-hmg-text-title">{value}</span>
    </div>
  )
}
