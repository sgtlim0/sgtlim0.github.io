'use client'

import React, { type CSSProperties, type ReactNode } from 'react'
import { useAnimatedList, type UseAnimatedListOptions, type AnimatedItem } from './hooks/useAnimatedList'
import { getTransitionPreset, type TransitionPresetType } from './Transition'
import type { TransitionState } from './hooks/useTransition'

export interface AnimatedListProps<T> extends UseAnimatedListOptions {
  /** Preset animation type (default: 'slideUp') */
  readonly preset?: TransitionPresetType
  /** Render function for each animated item */
  readonly children: (item: AnimatedItem<T>, style: CSSProperties) => ReactNode
  /** Optional className for the wrapper */
  readonly className?: string
  /** Exposed ref to the animated list controls */
  readonly controlRef?: React.MutableRefObject<AnimatedListControls<T> | null>
}

export interface AnimatedListControls<T> {
  readonly add: (key: string, item: T) => void
  readonly remove: (key: string) => void
  readonly set: (entries: ReadonlyArray<{ key: string; item: T }>) => void
  readonly items: ReadonlyArray<AnimatedItem<T>>
}

function getItemStyle(state: TransitionState, preset: TransitionPresetType, duration: number): CSSProperties {
  const presetStyles = getTransitionPreset(preset, duration)
  const isVisible = state === 'entering' || state === 'entered'
  return isVisible ? presetStyles.visible : presetStyles.hidden
}

/**
 * Render-prop component for animated lists.
 *
 * Uses useAnimatedList internally and exposes add/remove/set controls
 * via a controlRef. Each item is rendered with its computed transition style.
 *
 * @example
 * ```tsx
 * const controlRef = useRef<AnimatedListControls<string>>(null)
 *
 * <AnimatedList controlRef={controlRef} preset="slideUp" staggerDelay={80}>
 *   {({ key, item, state }, style) => (
 *     <div key={key} style={style}>
 *       {item}
 *       <button onClick={() => controlRef.current?.remove(key)}>Remove</button>
 *     </div>
 *   )}
 * </AnimatedList>
 * ```
 */
export default function AnimatedList<T>({
  preset = 'slideUp',
  duration = 300,
  staggerDelay = 50,
  children,
  className,
  controlRef,
}: AnimatedListProps<T>) {
  const { items, add, remove, set } = useAnimatedList<T>({ duration, staggerDelay })

  // Expose controls via ref.
  if (controlRef) {
    controlRef.current = { add, remove, set, items }
  }

  return (
    <div className={className}>
      {items.map((animatedItem) => {
        const style = getItemStyle(animatedItem.state, preset, duration)
        return children(animatedItem, style)
      })}
    </div>
  )
}
