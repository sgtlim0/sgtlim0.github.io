'use client'

import { useState } from 'react'

export interface ModelDistributionItem {
  model: string
  count: number
  percentage: number
}

export interface LiveModelDistributionProps {
  distribution: ModelDistributionItem[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']

function buildSegments(items: ModelDistributionItem[]) {
  const top5 = items.slice(0, 5)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let accumulated = 0

  return top5.map((item, i) => {
    const pct = item.percentage / 100
    const dashLen = pct * circumference
    const dashOffset = -accumulated * circumference
    accumulated += pct
    return {
      item,
      color: COLORS[i % COLORS.length],
      dashLen,
      dashOffset,
      circumference,
      radius,
    }
  })
}

function DonutSegments({
  segments,
  hovered,
  onHover,
}: {
  segments: ReturnType<typeof buildSegments>
  hovered: number | null
  onHover: (i: number | null) => void
}) {
  return (
    <>
      {segments.map((seg, i) => (
        <circle
          key={seg.item.model}
          cx="50"
          cy="50"
          r={seg.radius}
          fill="none"
          stroke={seg.color}
          strokeWidth={hovered === i ? 14 : 12}
          strokeDasharray={`${seg.dashLen} ${seg.circumference - seg.dashLen}`}
          strokeDashoffset={seg.dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-500 cursor-pointer"
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
        />
      ))}
    </>
  )
}

export function LiveModelDistribution({ distribution }: LiveModelDistributionProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const total = distribution.reduce((sum, d) => sum + d.count, 0)
  const segments = buildSegments(distribution)

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Model Distribution
      </h3>

      <div className="flex items-center gap-6">
        <svg
          width={160}
          height={160}
          viewBox="0 0 100 100"
          className="shrink-0"
          role="img"
          aria-label="Model distribution donut chart"
        >
          <circle cx="50" cy="50" r={40} fill="none" stroke="var(--border)" strokeWidth="12" />
          <DonutSegments segments={segments} hovered={hovered} onHover={setHovered} />
          <text
            x="50"
            y="47"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="var(--text-primary)"
          >
            {total.toLocaleString()}
          </text>
          <text x="50" y="57" textAnchor="middle" fontSize="5" fill="var(--text-secondary)">
            total
          </text>
        </svg>

        <div className="flex flex-col gap-2.5 min-w-0">
          {segments.map((seg, i) => (
            <div
              key={seg.item.model}
              className="flex items-center gap-2 transition-opacity duration-200"
              style={{
                opacity: hovered !== null && hovered !== i ? 0.4 : 1,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {seg.item.model}
              </span>
              <span
                className="text-xs font-semibold tabular-nums ml-auto shrink-0"
                style={{ color: 'var(--text-primary)' }}
              >
                {seg.item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LiveModelDistribution
