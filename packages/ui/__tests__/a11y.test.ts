import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { trapFocus, announceToScreenReader, getFocusableElements } from '../src/utils/a11y'

describe('a11y utilities', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  describe('trapFocus', () => {
    it('focuses the first focusable element on setup', () => {
      const btn1 = document.createElement('button')
      btn1.textContent = 'First'
      const btn2 = document.createElement('button')
      btn2.textContent = 'Second'
      container.appendChild(btn1)
      container.appendChild(btn2)

      trapFocus(container)

      expect(document.activeElement).toBe(btn1)
    })

    it('returns a cleanup function that removes the keydown listener', () => {
      const btn = document.createElement('button')
      container.appendChild(btn)
      const removeListenerSpy = vi.spyOn(container, 'removeEventListener')

      const cleanup = trapFocus(container)
      cleanup()

      expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('wraps focus from last to first on Tab', () => {
      const btn1 = document.createElement('button')
      btn1.textContent = 'First'
      const btn2 = document.createElement('button')
      btn2.textContent = 'Second'
      container.appendChild(btn1)
      container.appendChild(btn2)

      trapFocus(container)
      btn2.focus()
      expect(document.activeElement).toBe(btn2)

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      container.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(document.activeElement).toBe(btn1)
    })

    it('wraps focus from first to last on Shift+Tab', () => {
      const btn1 = document.createElement('button')
      btn1.textContent = 'First'
      const btn2 = document.createElement('button')
      btn2.textContent = 'Second'
      container.appendChild(btn1)
      container.appendChild(btn2)

      trapFocus(container)
      // trapFocus focuses first element
      expect(document.activeElement).toBe(btn1)

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      container.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(document.activeElement).toBe(btn2)
    })

    it('does nothing for non-Tab keys', () => {
      const btn = document.createElement('button')
      container.appendChild(btn)
      trapFocus(container)

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      container.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('does nothing when Tab is pressed but focus is not on first/last', () => {
      const btn1 = document.createElement('button')
      const btn2 = document.createElement('button')
      const btn3 = document.createElement('button')
      container.appendChild(btn1)
      container.appendChild(btn2)
      container.appendChild(btn3)

      trapFocus(container)
      btn2.focus()

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      container.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('handles container with no focusable elements', () => {
      const div = document.createElement('div')
      div.textContent = 'Not focusable'
      container.appendChild(div)

      const cleanup = trapFocus(container)

      // Should not throw and activeElement should not be set
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      container.dispatchEvent(event)

      cleanup()
    })

    it('does not focus first element if none are focusable', () => {
      const span = document.createElement('span')
      container.appendChild(span)

      trapFocus(container)
      // activeElement should not be the span (it's not focusable)
      expect(document.activeElement).not.toBe(span)
    })

    it('recognizes various focusable elements', () => {
      const link = document.createElement('a')
      link.href = 'https://example.com'
      const input = document.createElement('input')
      const select = document.createElement('select')
      const textarea = document.createElement('textarea')
      const tabindexDiv = document.createElement('div')
      tabindexDiv.tabIndex = 0

      container.appendChild(link)
      container.appendChild(input)
      container.appendChild(select)
      container.appendChild(textarea)
      container.appendChild(tabindexDiv)

      trapFocus(container)
      expect(document.activeElement).toBe(link)
    })
  })

  describe('announceToScreenReader', () => {
    it('creates an aria-live region and sets the message', () => {
      announceToScreenReader('Hello screen reader')

      const announcer = document.getElementById('sr-announcer-polite')
      expect(announcer).not.toBeNull()
      expect(announcer!.getAttribute('aria-live')).toBe('polite')
      expect(announcer!.getAttribute('aria-atomic')).toBe('true')
      expect(announcer!.getAttribute('role')).toBe('status')
    })

    it('creates assertive announcer with role="alert"', () => {
      announceToScreenReader('Urgent!', 'assertive')

      const announcer = document.getElementById('sr-announcer-assertive')
      expect(announcer).not.toBeNull()
      expect(announcer!.getAttribute('aria-live')).toBe('assertive')
      expect(announcer!.getAttribute('role')).toBe('alert')
    })

    it('reuses existing announcer container', () => {
      announceToScreenReader('First message')
      announceToScreenReader('Second message')

      const announcers = document.querySelectorAll('#sr-announcer-polite')
      expect(announcers).toHaveLength(1)
    })

    it('clears text content before setting new message via requestAnimationFrame', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0)
        return 0
      })

      announceToScreenReader('Test message')

      const announcer = document.getElementById('sr-announcer-polite')
      expect(announcer!.textContent).toBe('Test message')

      rafSpy.mockRestore()
    })

    it('styles announcer as visually hidden', () => {
      announceToScreenReader('Hidden text')

      const announcer = document.getElementById('sr-announcer-polite')
      expect(announcer!.style.position).toBe('absolute')
      expect(announcer!.style.width).toBe('1px')
      expect(announcer!.style.height).toBe('1px')
      expect(announcer!.style.overflow).toBe('hidden')
    })
  })

  describe('getFocusableElements', () => {
    it('returns array of focusable elements', () => {
      const btn = document.createElement('button')
      const input = document.createElement('input')
      const span = document.createElement('span')
      container.appendChild(btn)
      container.appendChild(input)
      container.appendChild(span)

      const elements = getFocusableElements(container)

      expect(elements).toHaveLength(2)
      expect(elements).toContain(btn)
      expect(elements).toContain(input)
      expect(elements).not.toContain(span)
    })

    it('returns empty array for container with no focusable elements', () => {
      const div = document.createElement('div')
      container.appendChild(div)

      const elements = getFocusableElements(container)
      expect(elements).toHaveLength(0)
    })

    it('excludes disabled elements', () => {
      const btn = document.createElement('button')
      btn.disabled = true
      const input = document.createElement('input')
      input.disabled = true
      container.appendChild(btn)
      container.appendChild(input)

      const elements = getFocusableElements(container)
      expect(elements).toHaveLength(0)
    })

    it('excludes elements with tabindex="-1"', () => {
      const div = document.createElement('div')
      div.tabIndex = -1
      container.appendChild(div)

      const elements = getFocusableElements(container)
      expect(elements).toHaveLength(0)
    })

    it('includes elements with tabindex="0"', () => {
      const div = document.createElement('div')
      div.tabIndex = 0
      container.appendChild(div)

      const elements = getFocusableElements(container)
      expect(elements).toHaveLength(1)
      expect(elements[0]).toBe(div)
    })
  })
})
