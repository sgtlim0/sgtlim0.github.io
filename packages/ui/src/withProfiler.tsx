'use client'

import React, { Profiler } from 'react'
import { onRenderCallback } from './utils/performanceProfiler'

function isDevEnvironment(): boolean {
  return typeof process !== 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : true
}

/**
 * Higher-order component that wraps a component with React.Profiler
 * for automatic render profiling.
 *
 * In production, returns the component unchanged (zero overhead).
 *
 * @example
 * const ProfiledComponent = withProfiler(MyComponent, 'MyComponent')
 */
export function withProfiler<P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string,
): React.ComponentType<P> {
  const name = displayName ?? WrappedComponent.displayName ?? WrappedComponent.name ?? 'Unknown'

  if (!isDevEnvironment()) {
    return WrappedComponent
  }

  function ProfiledComponent(props: P): React.ReactElement {
    return (
      <Profiler id={name} onRender={onRenderCallback}>
        <WrappedComponent {...props} />
      </Profiler>
    )
  }

  ProfiledComponent.displayName = `withProfiler(${name})`

  return ProfiledComponent
}

export default withProfiler
