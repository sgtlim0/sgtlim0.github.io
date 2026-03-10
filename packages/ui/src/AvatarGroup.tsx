'use client'

import React from 'react'
import Avatar from './Avatar'
import type { AvatarProps, AvatarSize } from './Avatar'

export interface AvatarGroupProps {
  /** Array of avatar props to render */
  avatars: AvatarProps[]
  /** Maximum number of avatars to display before "+N" */
  max?: number
  /** Size applied to all avatars in the group */
  size?: AvatarSize
  /** Additional CSS classes for the container */
  className?: string
}

const OVERLAP_MAP: Record<AvatarSize, string> = {
  xs: '-ml-1.5',
  sm: '-ml-2',
  md: '-ml-2.5',
  lg: '-ml-3',
  xl: '-ml-4',
}

const SIZE_PX_MAP: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

/**
 * AvatarGroup — renders multiple avatars in a stacked row with overlap.
 * When the number of avatars exceeds `max`, a "+N" indicator is shown.
 *
 * @example
 * <AvatarGroup
 *   avatars={[
 *     { name: "Alice", src: "/alice.jpg" },
 *     { name: "Bob", src: "/bob.jpg" },
 *     { name: "Charlie" },
 *   ]}
 *   max={2}
 *   size="md"
 * />
 */
export default function AvatarGroup({
  avatars,
  max,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const visibleAvatars = max != null && max > 0 ? avatars.slice(0, max) : avatars
  const overflowCount = max != null && max > 0 ? Math.max(0, avatars.length - max) : 0
  const overlapClass = OVERLAP_MAP[size]

  return (
    <div
      className={`flex items-center ${className}`}
      role="group"
      aria-label={`${avatars.length} avatars`}
    >
      {visibleAvatars.map((avatarProps, index) => (
        <div
          key={avatarProps.name ?? `avatar-${index}`}
          className={`relative ${index > 0 ? overlapClass : ''}`}
          style={{ zIndex: visibleAvatars.length - index }}
        >
          <Avatar
            {...avatarProps}
            size={size}
            className={`ring-2 ring-white ${avatarProps.className ?? ''}`}
          />
        </div>
      ))}

      {overflowCount > 0 && (
        <div
          className={`relative ${overlapClass} flex items-center justify-center ${SIZE_PX_MAP[size]} rounded-full bg-gray-200 text-gray-600 font-medium ring-2 ring-white`}
          style={{ zIndex: 0 }}
          data-testid="avatar-group-overflow"
          aria-label={`${overflowCount} more`}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  )
}
