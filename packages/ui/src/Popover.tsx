'use client'

import React, { cloneElement, isValidElement, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePopover } from './hooks/usePopover'
import type { PopoverPlacement, PopoverTrigger } from './hooks/usePopover'

export interface PopoverProps {
  /** Popover content — can contain interactive elements */
  readonly content: React.ReactNode
  /** Placement relative to trigger element */
  readonly placement?: PopoverPlacement
  /** Trigger mode: 'click' or 'hover' (default 'click') */
  readonly trigger?: PopoverTrigger
  /** Offset from trigger in px (default 8) */
  readonly offset?: number
  /** Whether clicking outside closes the popover (default true) */
  readonly closeOnOutsideClick?: boolean
  /** Trigger element — must accept ref forwarding */
  readonly children: React.ReactElement<Record<string, unknown>>
}

const arrowSize = 6

function getArrowStyle(placement: PopoverPlacement): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  }

  switch (placement) {
    case 'top':
      return {
        ...base,
        bottom: -arrowSize,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
        borderColor: 'var(--bg-surface, #FFFFFF) transparent transparent transparent',
      }
    case 'bottom':
      return {
        ...base,
        top: -arrowSize,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
        borderColor: 'transparent transparent var(--bg-surface, #FFFFFF) transparent',
      }
    case 'left':
      return {
        ...base,
        right: -arrowSize,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
        borderColor: 'transparent transparent transparent var(--bg-surface, #FFFFFF)',
      }
    case 'right':
      return {
        ...base,
        left: -arrowSize,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
        borderColor: 'transparent var(--bg-surface, #FFFFFF) transparent transparent',
      }
  }
}

/**
 * Popover component — renders interactive content via Portal.
 * Supports click or hover trigger, 4-direction placement with auto-flip,
 * CSS triangle arrow, Escape and outside-click to close.
 *
 * Unlike Tooltip, Popover content can contain interactive elements
 * (buttons, links, forms).
 *
 * @example
 * <Popover
 *   content={<div><p>Settings</p><button>Save</button></div>}
 *   placement="bottom"
 * >
 *   <button>Open menu</button>
 * </Popover>
 */
export function Popover({
  content,
  placement = 'bottom',
  trigger = 'click',
  offset = 8,
  closeOnOutsideClick = true,
  children,
}: PopoverProps) {
  const { isOpen, triggerProps, popoverProps } = usePopover({
    placement,
    trigger,
    offset,
    closeOnOutsideClick,
  })

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  // SSR-safe portal mount
  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  // Merge trigger props into child element
  const child = isValidElement(children)
    ? cloneElement(children, {
        ...triggerProps,
        ref: triggerProps.ref,
      } as Record<string, unknown>)
    : children

  const popoverElement = isOpen ? (
    <div
      {...popoverProps}
      data-testid="popover"
      data-placement={placement}
      role="dialog"
      aria-modal={false}
      style={{
        ...popoverProps.style,
        minWidth: 120,
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 14,
        lineHeight: 1.5,
        backgroundColor: 'var(--bg-surface, #FFFFFF)',
        color: 'var(--text-primary, #111827)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border-default, #E5E7EB)',
      }}
    >
      {content}
      <span style={getArrowStyle(placement)} data-testid="popover-arrow" />
    </div>
  ) : null

  return (
    <>
      {child}
      {portalContainer && popoverElement ? createPortal(popoverElement, portalContainer) : null}
    </>
  )
}

export default Popover
