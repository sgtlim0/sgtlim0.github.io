'use client'

import { useState } from 'react'
import type { RealtimeDataPoint } from './services/realtimeTypes'

export interface LiveLineChartProps {
  data: RealtimeDataPoint[]
  color?: string
  height?: number
  label?: string
}

const PADDING = { top: 24, right: 16, bottom: 32, left: 40 }
const VIEW_WIDTH = 400

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function computeScale(data: RealtimeDataPoint[]) {
  const values = data.map((d) => d.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const margin = (rawMax - rawMin) * 0.1 || 1
  return { min: rawMin - margin, max: rawMax + margin }
}

function buildPolyline(
  data: RealtimeDataPoint[],
  scale: { min: number; max: number },
  chartH: number,
) {
  const chartW = VIEW_WIDTH - PADDING.left - PADDING.right
  const range = scale.max - scale.min || 1

  return data.map((d, i) => {
    const x = PADDING.left + (i / Math.max(data.length - 1, 1)) * chartW
    const y = PADDING.top + (1 - (d.value - scale.min) / range) * chartH
    return { x, y, point: d }
  })
}

function GridLines({ chartH }: { chartH: number }) {
  const lines = [0, 0.25, 0.5, 0.75, 1]
  return (
    <>
      {lines.map((pct) => {
        const y = PADDING.top + pct * chartH
        return (
          <line
            key={pct}
            x1={PADDING.left}
            y1={y}
            x2={VIEW_WIDTH - PADDING.right}
            y2={y}
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="4 3"
          />
        )
      })}
    </>
  )
}

function YAxisLabels({ scale, chartH }: { scale: { min: number; max: number }; chartH: number }) {
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  return (
    <>
      {ticks.map((pct) => {
        const y = PADDING.top + pct * chartH
        const val = scale.max - pct * (scale.max - scale.min)
        return (
          <text
            key={pct}
            x={PADDING.left - 6}
            y={y + 3}
            textAnchor="end"
            fontSize="9"
            fill="var(--text-secondary)"
          >
            {Math.round(val).toLocaleString()}
          </text>
        )
      })}
    </>
  )
}

function XAxisLabels({ data }: { data: RealtimeDataPoint[] }) {
  if (data.length === 0) return null
  const count = Math.min(6, data.length)
  const step = Math.max(1, Math.floor((data.length - 1) / (count - 1)))
  const chartW = VIEW_WIDTH - PADDING.left - PADDING.right
  const indices = Array.from({ length: count }, (_, i) => Math.min(i * step, data.length - 1))

  return (
    <>
      {indices.map((idx) => {
        const x = PADDING.left + (idx / Math.max(data.length - 1, 1)) * chartW
        return (
          <text
            key={idx}
            x={x}
            y={PADDING.top + (VIEW_WIDTH * 0.5 - PADDING.top - PADDING.bottom) + PADDING.bottom - 6}
            textAnchor="middle"
            fontSize="9"
            fill="var(--text-secondary)"
          >
            {formatTime(data[idx].timestamp)}
          </text>
        )
      })}
    </>
  )
}

export function LiveLineChart({
  data,
  color = 'var(--primary)',
  height = 200,
  label,
}: LiveLineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (data.length === 0) return null

  const chartH = height - PADDING.top - PADDING.bottom
  const viewH = height
  const scale = computeScale(data)
  const coords = buildPolyline(data, scale, chartH)
  const polyPoints = coords.map((c) => `${c.x},${c.y}`).join(' ')

  const gradientId = `live-line-grad-${label ?? 'default'}`
  const fillPath = [
    `M${coords[0].x},${PADDING.top + chartH}`,
    ...coords.map((c) => `L${c.x},${c.y}`),
    `L${coords[coords.length - 1].x},${PADDING.top + chartH}`,
    'Z',
  ].join(' ')

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
      {label && (
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          {label}
        </h3>
      )}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${viewH}`}
          className="w-full"
          style={{ height }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <GridLines chartH={chartH} />
          <YAxisLabels scale={scale} chartH={chartH} />
          <XAxisLabels data={data} />

          <path d={fillPath} fill={`url(#${gradientId})`} className="transition-all duration-500" />

          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polyPoints}
            className="transition-all duration-500"
          />

          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={hovered === i ? 5 : 3}
              fill={color}
              stroke="var(--bg-card)"
              strokeWidth="2"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-all duration-150"
            />
          ))}
        </svg>

        {hovered !== null && coords[hovered] && (
          <div
            className="absolute px-2.5 py-1.5 rounded-lg text-xs font-medium pointer-events-none whitespace-nowrap shadow-lg z-10"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-card)',
              left: `${(coords[hovered].x / VIEW_WIDTH) * 100}%`,
              top: `${(coords[hovered].y / viewH) * 100 - 12}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {formatTime(data[hovered].timestamp)}: {data[hovered].value.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveLineChart
