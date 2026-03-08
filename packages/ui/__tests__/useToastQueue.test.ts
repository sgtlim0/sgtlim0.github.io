import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToastQueue } from '../src/hooks/useToastQueue'

describe('useToastQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // -----------------------------------------------------------------------
  // addToast / removeToast basics
  // -----------------------------------------------------------------------

  it('starts with an empty toast list', () => {
    const { result } = renderHook(() => useToastQueue())
    expect(result.current.toasts).toEqual([])
  })

  it('adds a toast and returns an id', () => {
    const { result } = renderHook(() => useToastQueue())

    let id: string = ''
    act(() => {
      id = result.current.addToast({ type: 'success', title: 'Saved' })
    })

    expect(id).toBeTruthy()
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Saved')
    expect(result.current.toasts[0].type).toBe('success')
  })

  it('adds multiple toasts in order', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'info', title: 'First' })
      result.current.addToast({ type: 'warning', title: 'Second' })
      result.current.addToast({ type: 'error', title: 'Third' })
    })

    expect(result.current.toasts).toHaveLength(3)
    expect(result.current.toasts[0].title).toBe('First')
    expect(result.current.toasts[1].title).toBe('Second')
    expect(result.current.toasts[2].title).toBe('Third')
  })

  it('removes a toast by id', () => {
    const { result } = renderHook(() => useToastQueue())

    let id: string = ''
    act(() => {
      id = result.current.addToast({ type: 'info', title: 'Remove me' })
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.removeToast(id)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('removes only the targeted toast, leaving others intact', () => {
    const { result } = renderHook(() => useToastQueue())

    let id1: string = ''
    let id2: string = ''
    act(() => {
      id1 = result.current.addToast({ type: 'info', title: 'A' })
      id2 = result.current.addToast({ type: 'info', title: 'B' })
      result.current.addToast({ type: 'info', title: 'C' })
    })

    act(() => {
      result.current.removeToast(id2)
    })

    expect(result.current.toasts).toHaveLength(2)
    expect(result.current.toasts[0].id).toBe(id1)
    expect(result.current.toasts[1].title).toBe('C')
  })

  // -----------------------------------------------------------------------
  // Auto-dismiss
  // -----------------------------------------------------------------------

  it('auto-dismisses after default duration (5000ms)', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'success', title: 'Auto' })
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(4999)
    })
    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.toasts).toHaveLength(0)
  })

  it('auto-dismisses after a custom duration', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'info', title: 'Quick', duration: 2000 })
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('does not auto-dismiss when duration is 0 (permanent)', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'error', title: 'Permanent', duration: 0 })
    })

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Permanent')
  })

  // -----------------------------------------------------------------------
  // Max 5 toasts
  // -----------------------------------------------------------------------

  it('enforces a maximum of 5 toasts, removing oldest first', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      for (let i = 1; i <= 6; i++) {
        result.current.addToast({ type: 'info', title: `Toast ${i}`, duration: 0 })
      }
    })

    expect(result.current.toasts).toHaveLength(5)
    expect(result.current.toasts[0].title).toBe('Toast 2')
    expect(result.current.toasts[4].title).toBe('Toast 6')
  })

  it('clears timer of evicted toast', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      for (let i = 1; i <= 6; i++) {
        result.current.addToast({ type: 'info', title: `T${i}`, duration: 10000 })
      }
    })

    // Toast 1 was evicted, its timer should be cleared.
    // Advance to trigger all remaining timers.
    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  // -----------------------------------------------------------------------
  // clearAll
  // -----------------------------------------------------------------------

  it('clearAll removes all toasts at once', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'success', title: 'A' })
      result.current.addToast({ type: 'error', title: 'B' })
      result.current.addToast({ type: 'warning', title: 'C' })
    })

    expect(result.current.toasts).toHaveLength(3)

    act(() => {
      result.current.clearAll()
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('clearAll cancels pending auto-dismiss timers', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'info', title: 'A', duration: 3000 })
      result.current.addToast({ type: 'info', title: 'B', duration: 3000 })
    })

    act(() => {
      result.current.clearAll()
    })

    // Advance past timer — should not cause errors or re-add toasts
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  // -----------------------------------------------------------------------
  // Defaults
  // -----------------------------------------------------------------------

  it('sets dismissible to true by default', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'info', title: 'Dismissible' })
    })

    expect(result.current.toasts[0].dismissible).toBe(true)
  })

  it('respects explicit dismissible=false', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'info', title: 'Sticky', dismissible: false })
    })

    expect(result.current.toasts[0].dismissible).toBe(false)
  })

  it('preserves description and action in the toast', () => {
    const onClick = vi.fn()
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({
        type: 'success',
        title: 'Done',
        description: 'File saved successfully',
        action: { label: 'Undo', onClick },
      })
    })

    const toast = result.current.toasts[0]
    expect(toast.description).toBe('File saved successfully')
    expect(toast.action?.label).toBe('Undo')
    toast.action?.onClick()
    expect(onClick).toHaveBeenCalledOnce()
  })

  // -----------------------------------------------------------------------
  // pauseTimer / resumeTimer
  // -----------------------------------------------------------------------

  it('pauseTimer prevents auto-dismiss', () => {
    const { result } = renderHook(() => useToastQueue())

    let id: string = ''
    act(() => {
      id = result.current.addToast({ type: 'info', title: 'Hovered', duration: 3000 })
    })

    // Advance 1.5s, then pause
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    act(() => {
      result.current.pauseTimer(id)
    })

    // Advance well past the original duration
    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.toasts).toHaveLength(1)
  })

  it('resumeTimer re-enables auto-dismiss with remaining time', () => {
    const { result } = renderHook(() => useToastQueue())

    let id: string = ''
    act(() => {
      id = result.current.addToast({ type: 'info', title: 'Resume', duration: 4000 })
    })

    act(() => {
      result.current.pauseTimer(id)
    })

    act(() => {
      result.current.resumeTimer(id, 2000)
    })

    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.toasts).toHaveLength(0)
  })

  // -----------------------------------------------------------------------
  // Unique IDs
  // -----------------------------------------------------------------------

  it('generates unique ids for each toast', () => {
    const { result } = renderHook(() => useToastQueue())

    const ids: string[] = []
    act(() => {
      ids.push(result.current.addToast({ type: 'info', title: 'A', duration: 0 }))
      ids.push(result.current.addToast({ type: 'info', title: 'B', duration: 0 }))
      ids.push(result.current.addToast({ type: 'info', title: 'C', duration: 0 }))
    })

    const unique = new Set(ids)
    expect(unique.size).toBe(3)
  })

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  it('removeToast with non-existent id is a no-op', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'info', title: 'A', duration: 0 })
    })

    act(() => {
      result.current.removeToast('non-existent-id')
    })

    expect(result.current.toasts).toHaveLength(1)
  })

  it('clearAll on empty list is a no-op', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.clearAll()
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('all four toast types are supported', () => {
    const { result } = renderHook(() => useToastQueue())

    act(() => {
      result.current.addToast({ type: 'success', title: 'S', duration: 0 })
      result.current.addToast({ type: 'error', title: 'E', duration: 0 })
      result.current.addToast({ type: 'warning', title: 'W', duration: 0 })
      result.current.addToast({ type: 'info', title: 'I', duration: 0 })
    })

    const types = result.current.toasts.map((t) => t.type)
    expect(types).toEqual(['success', 'error', 'warning', 'info'])
  })
})
