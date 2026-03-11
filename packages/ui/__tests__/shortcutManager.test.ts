import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createShortcutManager, resetIdCounter } from '../src/utils/shortcutManager'
import type { ShortcutManager } from '../src/utils/shortcutManager'

function makeKeyEvent(
  key: string,
  modifiers: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): KeyboardEvent {
  return {
    key,
    ctrlKey: modifiers.ctrlKey ?? false,
    metaKey: modifiers.metaKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    altKey: modifiers.altKey ?? false,
  } as unknown as KeyboardEvent
}

describe('createShortcutManager', () => {
  let manager: ShortcutManager

  beforeEach(() => {
    resetIdCounter()
    manager = createShortcutManager()
  })

  // -----------------------------------------------------------------------
  // register / unregister
  // -----------------------------------------------------------------------
  describe('register / unregister', () => {
    it('returns a unique id on register', () => {
      const id1 = manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Open search',
        category: 'navigation',
        enabled: true,
      })
      const id2 = manager.register({
        key: 'ctrl+p',
        handler: vi.fn(),
        description: 'Open palette',
        category: 'navigation',
        enabled: true,
      })
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
    })

    it('lists registered entries via getAll', () => {
      manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Search',
        category: 'nav',
        enabled: true,
      })
      expect(manager.getAll()).toHaveLength(1)
      expect(manager.getAll()[0].description).toBe('Search')
    })

    it('removes entry on unregister', () => {
      const id = manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Search',
        category: 'nav',
        enabled: true,
      })
      expect(manager.getAll()).toHaveLength(1)
      manager.unregister(id)
      expect(manager.getAll()).toHaveLength(0)
    })

    it('unregister with unknown id is a no-op', () => {
      manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Search',
        category: 'nav',
        enabled: true,
      })
      manager.unregister('unknown_id')
      expect(manager.getAll()).toHaveLength(1)
    })
  })

  // -----------------------------------------------------------------------
  // enable / disable
  // -----------------------------------------------------------------------
  describe('enable / disable', () => {
    it('disables a shortcut so it is not dispatched', () => {
      const handler = vi.fn()
      const id = manager.register({
        key: 'ctrl+k',
        handler,
        description: 'Search',
        category: 'nav',
        enabled: true,
      })
      manager.disable(id)
      expect(manager.getAll()[0].enabled).toBe(false)

      const event = makeKeyEvent('k', { ctrlKey: true })
      const handled = manager.handleKeyEvent(event)
      expect(handled).toBe(false)
      expect(handler).not.toHaveBeenCalled()
    })

    it('re-enables a disabled shortcut', () => {
      const handler = vi.fn()
      const id = manager.register({
        key: 'ctrl+k',
        handler,
        description: 'Search',
        category: 'nav',
        enabled: false,
      })
      manager.enable(id)
      expect(manager.getAll()[0].enabled).toBe(true)

      const event = makeKeyEvent('k', { ctrlKey: true })
      manager.handleKeyEvent(event)
      expect(handler).toHaveBeenCalledOnce()
    })

    it('enable/disable with unknown id is a no-op', () => {
      manager.enable('unknown')
      manager.disable('unknown')
      expect(manager.getAll()).toHaveLength(0)
    })
  })

  // -----------------------------------------------------------------------
  // scope
  // -----------------------------------------------------------------------
  describe('scope', () => {
    it('defaults to global scope', () => {
      expect(manager.getScope()).toBe('global')
    })

    it('sets and gets scope', () => {
      manager.setScope('editor')
      expect(manager.getScope()).toBe('editor')
    })

    it('global shortcuts fire regardless of current scope', () => {
      const handler = vi.fn()
      manager.register({
        key: 'ctrl+s',
        handler,
        description: 'Save',
        category: 'file',
        enabled: true,
        scope: 'global',
      })
      manager.setScope('editor')

      const event = makeKeyEvent('s', { ctrlKey: true })
      expect(manager.handleKeyEvent(event)).toBe(true)
      expect(handler).toHaveBeenCalledOnce()
    })

    it('scoped shortcuts only fire when scope matches', () => {
      const editorHandler = vi.fn()
      manager.register({
        key: 'ctrl+b',
        handler: editorHandler,
        description: 'Bold',
        category: 'editor',
        enabled: true,
        scope: 'editor',
      })

      // scope is global — should not fire
      const event = makeKeyEvent('b', { ctrlKey: true })
      expect(manager.handleKeyEvent(event)).toBe(false)
      expect(editorHandler).not.toHaveBeenCalled()

      // switch to editor scope — should fire
      manager.setScope('editor')
      expect(manager.handleKeyEvent(event)).toBe(true)
      expect(editorHandler).toHaveBeenCalledOnce()
    })

    it('modal scope shortcuts are isolated', () => {
      const modalHandler = vi.fn()
      const globalHandler = vi.fn()
      manager.register({
        key: 'escape',
        handler: modalHandler,
        description: 'Close modal',
        category: 'ui',
        enabled: true,
        scope: 'modal',
      })
      manager.register({
        key: 'escape',
        handler: globalHandler,
        description: 'Clear selection',
        category: 'ui',
        enabled: true,
        scope: 'global',
      })

      manager.setScope('modal')
      const event = makeKeyEvent('escape')
      manager.handleKeyEvent(event)

      // Both modal-scoped and global-scoped should match
      expect(modalHandler).toHaveBeenCalledOnce()
    })

    it('omitted scope defaults to global', () => {
      const handler = vi.fn()
      manager.register({
        key: 'ctrl+z',
        handler,
        description: 'Undo',
        category: 'edit',
        enabled: true,
      })
      manager.setScope('editor')

      const event = makeKeyEvent('z', { ctrlKey: true })
      expect(manager.handleKeyEvent(event)).toBe(true)
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  // -----------------------------------------------------------------------
  // conflict detection
  // -----------------------------------------------------------------------
  describe('conflict detection', () => {
    it('warns on duplicate key + scope', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Search',
        category: 'nav',
        enabled: true,
        scope: 'global',
      })
      manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Quick open',
        category: 'nav',
        enabled: true,
        scope: 'global',
      })

      expect(warnSpy).toHaveBeenCalledOnce()
      expect(warnSpy.mock.calls[0][0]).toContain('Conflict')
      expect(warnSpy.mock.calls[0][0]).toContain('ctrl+k')

      warnSpy.mockRestore()
    })

    it('does not warn when same key is in different scopes', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Global search',
        category: 'nav',
        enabled: true,
        scope: 'global',
      })
      manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Editor search',
        category: 'nav',
        enabled: true,
        scope: 'editor',
      })

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('detects conflict with normalized aliases (cmd vs meta)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      manager.register({
        key: 'meta+k',
        handler: vi.fn(),
        description: 'First',
        category: 'nav',
        enabled: true,
      })
      manager.register({
        key: 'cmd+k',
        handler: vi.fn(),
        description: 'Second',
        category: 'nav',
        enabled: true,
      })

      expect(warnSpy).toHaveBeenCalledOnce()
      warnSpy.mockRestore()
    })
  })

  // -----------------------------------------------------------------------
  // handleKeyEvent
  // -----------------------------------------------------------------------
  describe('handleKeyEvent', () => {
    it('returns true and calls handler on match', () => {
      const handler = vi.fn()
      manager.register({
        key: 'ctrl+shift+p',
        handler,
        description: 'Command palette',
        category: 'nav',
        enabled: true,
      })

      const event = makeKeyEvent('p', { ctrlKey: true, shiftKey: true })
      expect(manager.handleKeyEvent(event)).toBe(true)
      expect(handler).toHaveBeenCalledOnce()
    })

    it('returns false when no shortcut matches', () => {
      manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Search',
        category: 'nav',
        enabled: true,
      })

      const event = makeKeyEvent('j', { ctrlKey: true })
      expect(manager.handleKeyEvent(event)).toBe(false)
    })

    it('stops after first matching handler', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      manager.register({
        key: 'ctrl+k',
        handler: handler1,
        description: 'First',
        category: 'nav',
        enabled: true,
      })
      // Same key, will conflict-warn, but both registered
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      manager.register({
        key: 'ctrl+k',
        handler: handler2,
        description: 'Second',
        category: 'nav',
        enabled: true,
      })
      warnSpy.mockRestore()

      const event = makeKeyEvent('k', { ctrlKey: true })
      manager.handleKeyEvent(event)

      // Only first match should fire
      expect(handler1).toHaveBeenCalledOnce()
      expect(handler2).not.toHaveBeenCalled()
    })

    it('skips disabled entries', () => {
      const handler = vi.fn()
      const id = manager.register({
        key: 'ctrl+d',
        handler,
        description: 'Delete',
        category: 'edit',
        enabled: true,
      })
      manager.disable(id)

      const event = makeKeyEvent('d', { ctrlKey: true })
      expect(manager.handleKeyEvent(event)).toBe(false)
      expect(handler).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // getByCategory
  // -----------------------------------------------------------------------
  describe('getByCategory', () => {
    it('groups entries by category', () => {
      manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Search',
        category: 'navigation',
        enabled: true,
      })
      manager.register({
        key: 'ctrl+s',
        handler: vi.fn(),
        description: 'Save',
        category: 'file',
        enabled: true,
      })
      manager.register({
        key: 'ctrl+p',
        handler: vi.fn(),
        description: 'Palette',
        category: 'navigation',
        enabled: true,
      })

      const grouped = manager.getByCategory()
      expect(Object.keys(grouped).sort()).toEqual(['file', 'navigation'])
      expect(grouped['navigation']).toHaveLength(2)
      expect(grouped['file']).toHaveLength(1)
    })

    it('returns empty object when no entries', () => {
      expect(manager.getByCategory()).toEqual({})
    })
  })

  // -----------------------------------------------------------------------
  // reset
  // -----------------------------------------------------------------------
  describe('reset', () => {
    it('clears all entries and resets scope', () => {
      manager.register({
        key: 'ctrl+k',
        handler: vi.fn(),
        description: 'Search',
        category: 'nav',
        enabled: true,
      })
      manager.setScope('editor')

      manager.reset()

      expect(manager.getAll()).toHaveLength(0)
      expect(manager.getScope()).toBe('global')
    })
  })
})
