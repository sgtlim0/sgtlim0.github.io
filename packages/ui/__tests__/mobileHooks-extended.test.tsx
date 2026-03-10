import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { useRef, type RefObject } from 'react'

// Mock the mobileService
vi.mock('../src/mobile/services/mobileService', () => ({
  getChatList: vi.fn().mockResolvedValue([
    { id: 'mc-1', title: 'Test Chat', lastMessage: 'Hello', model: 'H Chat', timestamp: Date.now(), unread: false },
  ]),
  getAssistants: vi.fn().mockResolvedValue([
    { id: 'ma-1', name: 'Assistant 1', description: 'Desc', icon: 'Bot', category: 'general', model: 'H Chat', isFavorite: true },
    { id: 'ma-2', name: 'Assistant 2', description: 'Desc', icon: 'Bot', category: 'general', model: 'H Chat', isFavorite: false },
  ]),
  getSettings: vi.fn().mockResolvedValue([
    { id: 'ms-1', label: 'Dark Mode', type: 'toggle', value: false, section: 'general' },
    { id: 'ms-2', label: 'Language', type: 'select', value: 'ko', section: 'general' },
    { id: 'ms-3', label: 'Privacy', type: 'toggle', value: true, section: 'privacy' },
  ]),
  toggleFavorite: vi.fn().mockResolvedValue(undefined),
  updateSetting: vi.fn().mockResolvedValue(undefined),
  deleteChat: vi.fn().mockResolvedValue(undefined),
}))

import * as svc from '../src/mobile/services/mobileService'
import {
  useMobileTabs,
  useChatList,
  useAssistants,
  useMobileSettings,
  useSwipeGesture,
} from '../src/mobile/services/mobileHooks'

describe('mobileHooks extended coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useChatList - deleteChat', () => {
    it('removes chat from list after deletion', async () => {
      let hookResult: ReturnType<typeof useChatList> | undefined

      function TestComp() {
        hookResult = useChatList()
        return null
      }

      await act(async () => {
        render(<TestComp />)
      })

      expect(hookResult!.chats).toHaveLength(1)

      await act(async () => {
        await hookResult!.deleteChat('mc-1')
      })

      expect(svc.deleteChat).toHaveBeenCalledWith('mc-1')
      expect(hookResult!.chats).toHaveLength(0)
    })

    it('exposes refresh function', async () => {
      let hookResult: ReturnType<typeof useChatList> | undefined

      function TestComp() {
        hookResult = useChatList()
        return null
      }

      await act(async () => {
        render(<TestComp />)
      })

      expect(typeof hookResult!.refresh).toBe('function')
    })
  })

  describe('useAssistants - toggleFavorite', () => {
    it('toggles favorite status', async () => {
      let hookResult: ReturnType<typeof useAssistants> | undefined

      function TestComp() {
        hookResult = useAssistants()
        return null
      }

      await act(async () => {
        render(<TestComp />)
      })

      expect(hookResult!.favorites).toHaveLength(1)
      expect(hookResult!.favorites[0].id).toBe('ma-1')

      // Toggle ma-1 to unfavorite
      await act(async () => {
        await hookResult!.toggleFavorite('ma-1')
      })

      expect(svc.toggleFavorite).toHaveBeenCalledWith('ma-1')
      expect(hookResult!.favorites).toHaveLength(0)

      // Toggle ma-2 to favorite
      await act(async () => {
        await hookResult!.toggleFavorite('ma-2')
      })

      expect(hookResult!.favorites).toHaveLength(1)
      expect(hookResult!.favorites[0].id).toBe('ma-2')
    })

    it('exposes refresh function', async () => {
      let hookResult: ReturnType<typeof useAssistants> | undefined

      function TestComp() {
        hookResult = useAssistants()
        return null
      }

      await act(async () => {
        render(<TestComp />)
      })

      expect(typeof hookResult!.refresh).toBe('function')
    })
  })

  describe('useMobileSettings - updateSetting', () => {
    it('updates a setting value', async () => {
      let hookResult: ReturnType<typeof useMobileSettings> | undefined

      function TestComp() {
        hookResult = useMobileSettings()
        return null
      }

      await act(async () => {
        render(<TestComp />)
      })

      expect(hookResult!.settings).toHaveLength(3)

      await act(async () => {
        await hookResult!.updateSetting('ms-1', true)
      })

      expect(svc.updateSetting).toHaveBeenCalledWith('ms-1', true)
      const updatedSetting = hookResult!.settings.find((s) => s.id === 'ms-1')
      expect(updatedSetting!.value).toBe(true)
    })

    it('updates string setting value', async () => {
      let hookResult: ReturnType<typeof useMobileSettings> | undefined

      function TestComp() {
        hookResult = useMobileSettings()
        return null
      }

      await act(async () => {
        render(<TestComp />)
      })

      await act(async () => {
        await hookResult!.updateSetting('ms-2', 'en')
      })

      expect(svc.updateSetting).toHaveBeenCalledWith('ms-2', 'en')
      const updatedSetting = hookResult!.settings.find((s) => s.id === 'ms-2')
      expect(updatedSetting!.value).toBe('en')
    })

    it('groups settings correctly', async () => {
      let hookResult: ReturnType<typeof useMobileSettings> | undefined

      function TestComp() {
        hookResult = useMobileSettings()
        return null
      }

      await act(async () => {
        render(<TestComp />)
      })

      expect(hookResult!.grouped.general).toHaveLength(2)
      expect(hookResult!.grouped.privacy).toHaveLength(1)
      expect(hookResult!.grouped.notification).toHaveLength(0)
      expect(hookResult!.grouped.about).toHaveLength(0)
    })
  })

  describe('useSwipeGesture', () => {
    // Helper to create touch events (jsdom doesn't have Touch constructor)
    function createTouchEvent(
      type: string,
      clientX: number,
      clientY: number,
      target: HTMLElement,
    ) {
      const touchObj = { identifier: 0, target, clientX, clientY }
      const event = new Event(type, { bubbles: true }) as unknown as {
        touches: typeof touchObj[]
        changedTouches: typeof touchObj[]
      } & Event
      Object.defineProperty(event, 'touches', { value: [touchObj] })
      Object.defineProperty(event, 'changedTouches', { value: [touchObj] })
      return event as unknown as Event
    }

    it('calls onSwipeLeft when swiped left beyond threshold', async () => {
      const onSwipeLeft = vi.fn()
      const onSwipeRight = vi.fn()
      let divRef: RefObject<HTMLDivElement | null> | undefined

      function TestComp() {
        const ref = useRef<HTMLDivElement>(null)
        divRef = ref
        useSwipeGesture(ref, { onSwipeLeft, onSwipeRight, threshold: 50 })
        return <div ref={ref} data-testid="swipeable" style={{ width: 300, height: 300 }} />
      }

      await act(async () => {
        render(<TestComp />)
      })

      const el = divRef!.current!

      act(() => {
        el.dispatchEvent(createTouchEvent('touchstart', 200, 100, el))
        el.dispatchEvent(createTouchEvent('touchend', 100, 100, el))
      })

      expect(onSwipeLeft).toHaveBeenCalledOnce()
      expect(onSwipeRight).not.toHaveBeenCalled()
    })

    it('calls onSwipeRight when swiped right beyond threshold', async () => {
      const onSwipeLeft = vi.fn()
      const onSwipeRight = vi.fn()
      let divRef: RefObject<HTMLDivElement | null> | undefined

      function TestComp() {
        const ref = useRef<HTMLDivElement>(null)
        divRef = ref
        useSwipeGesture(ref, { onSwipeLeft, onSwipeRight, threshold: 50 })
        return <div ref={ref} style={{ width: 300, height: 300 }} />
      }

      await act(async () => {
        render(<TestComp />)
      })

      const el = divRef!.current!

      act(() => {
        el.dispatchEvent(createTouchEvent('touchstart', 100, 100, el))
        el.dispatchEvent(createTouchEvent('touchend', 200, 100, el))
      })

      expect(onSwipeRight).toHaveBeenCalledOnce()
      expect(onSwipeLeft).not.toHaveBeenCalled()
    })

    it('does not trigger swipe if below threshold', async () => {
      const onSwipeLeft = vi.fn()
      const onSwipeRight = vi.fn()
      let divRef: RefObject<HTMLDivElement | null> | undefined

      function TestComp() {
        const ref = useRef<HTMLDivElement>(null)
        divRef = ref
        useSwipeGesture(ref, { onSwipeLeft, onSwipeRight, threshold: 50 })
        return <div ref={ref} style={{ width: 300, height: 300 }} />
      }

      await act(async () => {
        render(<TestComp />)
      })

      const el = divRef!.current!

      act(() => {
        el.dispatchEvent(createTouchEvent('touchstart', 100, 100, el))
        el.dispatchEvent(createTouchEvent('touchend', 120, 100, el))
      })

      expect(onSwipeLeft).not.toHaveBeenCalled()
      expect(onSwipeRight).not.toHaveBeenCalled()
    })

    it('does not trigger swipe if vertical movement is dominant', async () => {
      const onSwipeLeft = vi.fn()
      const onSwipeRight = vi.fn()
      let divRef: RefObject<HTMLDivElement | null> | undefined

      function TestComp() {
        const ref = useRef<HTMLDivElement>(null)
        divRef = ref
        useSwipeGesture(ref, { onSwipeLeft, onSwipeRight, threshold: 50 })
        return <div ref={ref} style={{ width: 300, height: 300 }} />
      }

      await act(async () => {
        render(<TestComp />)
      })

      const el = divRef!.current!

      act(() => {
        el.dispatchEvent(createTouchEvent('touchstart', 100, 100, el))
        el.dispatchEvent(createTouchEvent('touchend', 160, 250, el))
      })

      expect(onSwipeLeft).not.toHaveBeenCalled()
      expect(onSwipeRight).not.toHaveBeenCalled()
    })

    it('handles null ref gracefully', async () => {
      const onSwipeLeft = vi.fn()

      function TestComp() {
        const ref = useRef<HTMLDivElement>(null)
        useSwipeGesture(ref, { onSwipeLeft })
        return <div>No ref attached</div>
      }

      // Should not throw
      await act(async () => {
        render(<TestComp />)
      })

      expect(onSwipeLeft).not.toHaveBeenCalled()
    })

    it('cleans up event listeners on unmount', async () => {
      const onSwipeLeft = vi.fn()
      let divRef: RefObject<HTMLDivElement | null> | undefined

      function TestComp() {
        const ref = useRef<HTMLDivElement>(null)
        divRef = ref
        useSwipeGesture(ref, { onSwipeLeft })
        return <div ref={ref} />
      }

      const { unmount } = await act(async () => render(<TestComp />))

      const el = divRef!.current!
      const removeSpy = vi.spyOn(el, 'removeEventListener')

      unmount()

      expect(removeSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith('touchend', expect.any(Function))
    })
  })
})
