'use client'

import React from 'react'
import { SkeletonPulse, SkeletonText, SkeletonCard, SkeletonTable } from './Skeleton'

export type PageSkeletonVariant = 'dashboard' | 'list' | 'detail' | 'form' | 'chat'

export interface PageSkeletonProps {
  variant: PageSkeletonVariant
  className?: string
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" role="status" aria-label="Loading dashboard">
      {/* Header */}
      <SkeletonPulse className="h-8 w-1/3" />
      {/* 4 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
      {/* Table */}
      <SkeletonTable rows={5} cols={4} />
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" role="status" aria-label="Loading list">
      {/* Header */}
      <SkeletonPulse className="h-8 w-1/4" />
      {/* 10 list items */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg p-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <SkeletonPulse className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-2/3" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex gap-6" aria-busy="true" role="status" aria-label="Loading detail">
      {/* Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 space-y-4">
        <SkeletonPulse className="h-6 w-3/4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-4 w-full" />
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 space-y-6">
        <SkeletonPulse className="h-8 w-2/3" />
        <SkeletonText lines={4} />
        <SkeletonPulse className="h-48 rounded-lg" />
        <SkeletonText lines={3} />
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="max-w-2xl space-y-6" aria-busy="true" role="status" aria-label="Loading form">
      {/* Header */}
      <SkeletonPulse className="h-8 w-1/3" />
      {/* 5 form fields */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonPulse className="h-4 w-1/4" />
          <SkeletonPulse className="h-10 w-full rounded-md" />
        </div>
      ))}
      {/* Submit button */}
      <SkeletonPulse className="h-10 w-32 rounded-md" />
    </div>
  )
}

function ChatSkeleton() {
  return (
    <div className="flex h-full" aria-busy="true" role="status" aria-label="Loading chat">
      {/* Sidebar */}
      <div className="hidden md:block w-72 flex-shrink-0 space-y-3 p-4" style={{ borderRight: '1px solid var(--border)' }}>
        <SkeletonPulse className="h-10 w-full rounded-md" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonPulse className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <SkeletonPulse className="h-4 w-3/4" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      {/* Message list */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        <div className="flex-1 space-y-4">
          {/* Messages alternating left/right */}
          <div className="flex justify-start">
            <SkeletonPulse className="h-16 w-2/3 rounded-lg" />
          </div>
          <div className="flex justify-end">
            <SkeletonPulse className="h-12 w-1/2 rounded-lg" />
          </div>
          <div className="flex justify-start">
            <SkeletonPulse className="h-20 w-3/5 rounded-lg" />
          </div>
          <div className="flex justify-end">
            <SkeletonPulse className="h-10 w-2/5 rounded-lg" />
          </div>
        </div>
        {/* Input bar */}
        <SkeletonPulse className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}

const VARIANT_MAP: Record<PageSkeletonVariant, React.FC> = {
  dashboard: DashboardSkeleton,
  list: ListSkeleton,
  detail: DetailSkeleton,
  form: FormSkeleton,
  chat: ChatSkeleton,
}

export function PageSkeleton({ variant, className = '' }: PageSkeletonProps) {
  const VariantComponent = VARIANT_MAP[variant]
  return (
    <div className={className}>
      <VariantComponent />
    </div>
  )
}
