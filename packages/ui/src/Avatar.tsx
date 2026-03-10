'use client'

import React, { useState, useCallback } from 'react'
import { getInitials, getAvatarColor } from './utils/avatarUtils'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy'
export type AvatarShape = 'circle' | 'square'

export interface AvatarProps {
  /** Image URL */
  src?: string
  /** Alt text for the image */
  alt?: string
  /** Name used for generating initials and deterministic color */
  name?: string
  /** Avatar size */
  size?: AvatarSize
  /** Online status indicator */
  status?: AvatarStatus
  /** Shape of the avatar */
  shape?: AvatarShape
  /** Additional CSS classes */
  className?: string
  /** Custom fallback content when no image or name */
  fallback?: React.ReactNode
}

const SIZE_MAP: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-2 h-2 border' },
  sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2.5 h-2.5 border-[1.5px]' },
  md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-3 h-3 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3.5 h-3.5 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-lg', status: 'w-4 h-4 border-2' },
}

const STATUS_COLOR_MAP: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
}

const SHAPE_MAP: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-lg',
}

/** Default user icon SVG for when no image or name is provided */
function DefaultIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

/**
 * Avatar component — displays a user's image, initials, or a default icon.
 *
 * Features:
 * - Image loading with error fallback
 * - Initials from name (Korean/English)
 * - Deterministic background color from name hash
 * - Status indicator (online/offline/away/busy)
 * - Multiple sizes (xs/sm/md/lg/xl)
 * - Circle or square shape
 *
 * @example
 * <Avatar src="/user.jpg" name="John Doe" size="lg" status="online" />
 * <Avatar name="김철수" size="md" />
 * <Avatar size="sm" fallback={<CustomIcon />} />
 */
export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  shape = 'circle',
  className = '',
  fallback,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  const handleImgError = useCallback(() => {
    setImgError(true)
  }, [])

  const sizeStyles = SIZE_MAP[size]
  const shapeClass = SHAPE_MAP[shape]
  const initials = getInitials(name)
  const bgColor = getAvatarColor(name)

  const showImage = src && !imgError
  const showInitials = !showImage && initials.length > 0
  const showFallback = !showImage && !showInitials

  const altText = alt ?? name ?? 'Avatar'

  return (
    <div
      className={`relative inline-flex shrink-0 ${sizeStyles.container} ${className}`}
      role="img"
      aria-label={altText}
    >
      {/* Avatar content */}
      <div
        className={`flex items-center justify-center w-full h-full overflow-hidden ${shapeClass} ${
          showImage ? '' : 'text-white font-medium'
        } ${sizeStyles.text}`}
        style={showImage ? undefined : { backgroundColor: showFallback ? '#9CA3AF' : bgColor }}
      >
        {showImage && (
          <img
            src={src}
            alt={altText}
            className="w-full h-full object-cover"
            onError={handleImgError}
          />
        )}

        {showInitials && <span aria-hidden="true">{initials}</span>}

        {showFallback && (
          fallback ?? <DefaultIcon className="w-3/5 h-3/5 text-white" />
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${sizeStyles.status} ${STATUS_COLOR_MAP[status]} ${
            shape === 'circle' ? 'rounded-full' : 'rounded-full'
          } border-white`}
          data-testid="avatar-status"
          aria-label={status}
        />
      )}
    </div>
  )
}
