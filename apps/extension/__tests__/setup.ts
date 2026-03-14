import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock chrome APIs
const mockStorage: Record<string, unknown> = {}

const chromeStorageLocal = {
  get: vi.fn((keys: string | string[]) => {
    const keyList = typeof keys === 'string' ? [keys] : keys
    const result: Record<string, unknown> = {}
    for (const key of keyList) {
      if (key in mockStorage) result[key] = mockStorage[key]
    }
    return Promise.resolve(result)
  }),
  set: vi.fn((items: Record<string, unknown>) => {
    Object.assign(mockStorage, items)
    return Promise.resolve()
  }),
  remove: vi.fn((keys: string | string[]) => {
    const keyList = typeof keys === 'string' ? [keys] : keys
    for (const key of keyList) delete mockStorage[key]
    return Promise.resolve()
  }),
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
}

Object.defineProperty(globalThis, 'chrome', {
  value: {
    storage: { local: chromeStorageLocal },
    runtime: {
      sendMessage: vi.fn(),
      lastError: null,
      onMessage: { addListener: vi.fn() },
      onInstalled: { addListener: vi.fn() },
      openOptionsPage: vi.fn(),
    },
    tabs: {
      sendMessage: vi.fn(),
      query: vi.fn(),
    },
    contextMenus: {
      create: vi.fn(),
      removeAll: vi.fn(),
      onClicked: { addListener: vi.fn() },
    },
    action: { openPopup: vi.fn() },
    sidePanel: { open: vi.fn() },
    alarms: {
      create: vi.fn(),
      onAlarm: { addListener: vi.fn() },
    },
  },
  writable: true,
  configurable: true,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
  configurable: true,
})

// Reset storage between tests
beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  vi.clearAllMocks()
})
