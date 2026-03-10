/**
 * Performance Profiler — React.Profiler onRender callback wrapper
 * and global profiling registry.
 *
 * Only active when NODE_ENV !== 'production'.
 */

export interface ProfileMetrics {
  readonly id: string
  readonly renderCount: number
  readonly lastRenderTime: number
  readonly averageRenderTime: number
  readonly maxRenderTime: number
  readonly totalRenderTime: number
}

interface MutableMetrics {
  id: string
  renderCount: number
  lastRenderTime: number
  maxRenderTime: number
  totalRenderTime: number
}

const registry = new Map<string, MutableMetrics>()

function isEnabled(): boolean {
  return typeof process !== 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : true
}

/**
 * Record a render measurement for the given component id.
 * Called from React.Profiler onRender or manually.
 */
export function recordRender(id: string, actualDuration: number): void {
  if (!isEnabled()) return

  const existing = registry.get(id)
  if (existing) {
    const updated: MutableMetrics = {
      id,
      renderCount: existing.renderCount + 1,
      lastRenderTime: actualDuration,
      maxRenderTime: Math.max(existing.maxRenderTime, actualDuration),
      totalRenderTime: existing.totalRenderTime + actualDuration,
    }
    registry.set(id, updated)
  } else {
    registry.set(id, {
      id,
      renderCount: 1,
      lastRenderTime: actualDuration,
      maxRenderTime: actualDuration,
      totalRenderTime: actualDuration,
    })
  }
}

/**
 * React.Profiler onRender callback.
 * Use as: <Profiler id="MyComp" onRender={onRenderCallback}>
 */
export function onRenderCallback(
  id: string,
  _phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
): void {
  recordRender(id, actualDuration)
}

function toProfileMetrics(m: MutableMetrics): ProfileMetrics {
  return {
    id: m.id,
    renderCount: m.renderCount,
    lastRenderTime: m.lastRenderTime,
    averageRenderTime: m.renderCount > 0 ? m.totalRenderTime / m.renderCount : 0,
    maxRenderTime: m.maxRenderTime,
    totalRenderTime: m.totalRenderTime,
  }
}

/**
 * Get profile metrics for a single component.
 */
export function getProfile(id: string): ProfileMetrics | undefined {
  const m = registry.get(id)
  return m ? toProfileMetrics(m) : undefined
}

/**
 * Get all profiled component metrics.
 */
export function getProfileResults(): ReadonlyArray<ProfileMetrics> {
  if (!isEnabled()) return []
  return Array.from(registry.values()).map(toProfileMetrics)
}

/**
 * Clear all profiling data.
 */
export function clearProfiles(): void {
  registry.clear()
}

/**
 * Clear profile data for a single component.
 */
export function clearProfile(id: string): void {
  registry.delete(id)
}
