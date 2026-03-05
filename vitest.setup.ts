import '@testing-library/jest-dom/vitest'

// Mock CSS variables for component tests
const mockCSSVariables: Record<string, string> = {
  '--primary': '#2563EB',
  '--primary-hover': '#1D4ED8',
  '--bg-page': '#FFFFFF',
  '--bg-card': '#F9FAFB',
  '--bg-hover': '#F3F4F6',
  '--text-primary': '#111827',
  '--text-secondary': '#6B7280',
  '--text-white': '#FFFFFF',
  '--border': '#E5E7EB',
  '--danger': '#EF4444',
}

Object.entries(mockCSSVariables).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value)
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
