/**
 * Performance utilities for lazy initialization, debounce, and throttle.
 */

/**
 * Lazy initialization wrapper — defers computation until first access.
 */
export function lazy<T>(factory: () => T): () => T {
  let value: T | undefined
  let initialized = false
  return () => {
    if (!initialized) {
      value = factory()
      initialized = true
    }
    return value as T
  }
}

/**
 * Debounce function for search inputs and resize handlers.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle function for scroll and resize events.
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
