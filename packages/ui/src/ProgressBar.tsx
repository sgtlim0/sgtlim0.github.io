'use client'

import React from 'react'

export interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'linear' | 'circular'
  size?: 'sm' | 'md' | 'lg'
  color?: string
  showLabel?: boolean
  label?: string
  animated?: boolean
  indeterminate?: boolean
  className?: string
}

const LINEAR_HEIGHTS: Record<string, string> = {
  sm: '4px',
  md: '8px',
  lg: '12px',
}

const CIRCULAR_SIZES: Record<string, number> = {
  sm: 32,
  md: 48,
  lg: 64,
}

const STROKE_WIDTHS: Record<string, number> = {
  sm: 3,
  md: 4,
  lg: 5,
}

function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0
  const pct = (value / max) * 100
  return Math.min(100, Math.max(0, pct))
}

function LinearProgress({
  percent,
  size = 'md',
  color = 'var(--primary, #3b82f6)',
  showLabel = false,
  label,
  animated = false,
  indeterminate = false,
  className = '',
}: {
  percent: number
  size?: 'sm' | 'md' | 'lg'
  color?: string
  showLabel?: boolean
  label?: string
  animated?: boolean
  indeterminate?: boolean
  className?: string
}) {
  const height = LINEAR_HEIGHTS[size] || LINEAR_HEIGHTS.md
  const displayLabel = label ?? `${Math.round(percent)}%`

  return (
    <div className={className}>
      <div
        style={{
          height,
          width: '100%',
          backgroundColor: 'var(--bg-hover, #e5e7eb)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          data-testid="progress-fill"
          style={{
            height: '100%',
            width: indeterminate ? '40%' : `${percent}%`,
            backgroundColor: color,
            borderRadius: '9999px',
            transition: indeterminate ? 'none' : 'width 0.3s ease',
            position: 'relative',
            ...(indeterminate
              ? { animation: 'hchat-progress-indeterminate 1.5s ease-in-out infinite' }
              : {}),
            ...(animated && !indeterminate
              ? {
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 8px,
                    rgba(255,255,255,0.2) 8px,
                    rgba(255,255,255,0.2) 16px
                  )`,
                  backgroundSize: '32px 32px',
                  animation: 'hchat-progress-stripe 0.6s linear infinite',
                }
              : {}),
          }}
        />
      </div>
      {showLabel && (
        <span
          data-testid="progress-label"
          style={{
            display: 'block',
            marginTop: '4px',
            fontSize: '12px',
            color: 'var(--text-secondary, #6b7280)',
            textAlign: 'right',
          }}
        >
          {displayLabel}
        </span>
      )}
      <style>{`
        @keyframes hchat-progress-stripe {
          0% { background-position: 0 0; }
          100% { background-position: 32px 0; }
        }
        @keyframes hchat-progress-indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}

function CircularProgress({
  percent,
  size = 'md',
  color = 'var(--primary, #3b82f6)',
  showLabel = false,
  label,
  indeterminate = false,
  className = '',
}: {
  percent: number
  size?: 'sm' | 'md' | 'lg'
  color?: string
  showLabel?: boolean
  label?: string
  indeterminate?: boolean
  className?: string
}) {
  const diameter = CIRCULAR_SIZES[size] || CIRCULAR_SIZES.md
  const strokeWidth = STROKE_WIDTHS[size] || STROKE_WIDTHS.md
  const radius = (diameter - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const displayLabel = label ?? `${Math.round(percent)}%`

  const labelFontSize = size === 'sm' ? 8 : size === 'lg' ? 14 : 11

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: diameter,
        height: diameter,
      }}
    >
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        style={indeterminate ? { animation: 'hchat-circular-rotate 1.4s linear infinite' } : undefined}
      >
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-hover, #e5e7eb)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          data-testid="progress-circle"
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : offset}
          style={{
            transition: indeterminate ? 'none' : 'stroke-dashoffset 0.3s ease',
            transformOrigin: 'center',
            transform: 'rotate(-90deg)',
          }}
        />
      </svg>
      {showLabel && !indeterminate && (
        <span
          data-testid="progress-label"
          style={{
            position: 'absolute',
            fontSize: `${labelFontSize}px`,
            fontWeight: 600,
            color: 'var(--text-primary, #111827)',
          }}
        >
          {displayLabel}
        </span>
      )}
      <style>{`
        @keyframes hchat-circular-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function ProgressBar({
  value,
  max = 100,
  variant = 'linear',
  size = 'md',
  color,
  showLabel = false,
  label,
  animated = false,
  indeterminate = false,
  className = '',
}: ProgressBarProps) {
  const percent = indeterminate ? 0 : clampPercent(value, max)
  const ariaLabel = label ?? (indeterminate ? 'Loading' : `${Math.round(percent)}%`)

  return (
    <div
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      {variant === 'circular' ? (
        <CircularProgress
          percent={percent}
          size={size}
          color={color}
          showLabel={showLabel}
          label={label}
          indeterminate={indeterminate}
          className={className}
        />
      ) : (
        <LinearProgress
          percent={percent}
          size={size}
          color={color}
          showLabel={showLabel}
          label={label}
          animated={animated}
          indeterminate={indeterminate}
          className={className}
        />
      )}
    </div>
  )
}

export { clampPercent }
