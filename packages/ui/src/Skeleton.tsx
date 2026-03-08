
import React from 'react';

interface SkeletonPulseProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonPulse({ className = '', style }: SkeletonPulseProps) {
  return (
    <div
      className={`rounded ${className}`}
      style={{
        background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

interface SkeletonTextProps {
  lines?: number;
  width?: string;
}

export function SkeletonText({ lines = 1, width = '100%' }: SkeletonTextProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className="h-4"
          style={{
            width: i === lines - 1 && lines > 1 ? '75%' : width,
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  lines?: number;
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className="rounded-lg p-6 space-y-4"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      <SkeletonPulse className="h-6 w-1/3" />
      <SkeletonText lines={lines} />
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 5, cols = 4 }: SkeletonTableProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonPulse key={i} className="h-5 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <SkeletonPulse key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonChartProps {
  height?: number;
}

export function SkeletonChart({ height = 300 }: SkeletonChartProps) {
  return (
    <div className="space-y-4">
      <SkeletonPulse className="h-6 w-1/4" />
      <SkeletonPulse
        className="rounded-lg"
        style={{ height: `${height}px` }}
      />
      <div className="flex justify-center gap-6 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <SkeletonPulse className="h-3 w-3 rounded-full" />
            <SkeletonPulse className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
