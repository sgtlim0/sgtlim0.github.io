import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks — must be declared before component imports
// ---------------------------------------------------------------------------

vi.mock('../src/hooks/useDataExport', () => ({
  useDataExport: () => ({
    exportCSV: vi.fn(),
    exportJSON: vi.fn(),
    isExporting: false,
  }),
}))

vi.mock('../src/utils/errorMonitoring', () => ({
  captureError: vi.fn(),
}))

vi.mock('../src/utils/imagePlaceholder', () => ({
  generateBlurDataURL: (_w: number, _h: number) =>
    'data:image/svg+xml;base64,MOCK_BLUR',
  getShimmerStyle: () => ({
    background: 'linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%)',
    backgroundSize: '200% 100%',
    animation: 'image-shimmer 1.5s infinite',
  }),
  SHIMMER_KEYFRAMES: '@keyframes image-shimmer { 0%{} 100%{} }',
}))

vi.mock('../src/hooks/useCommandPalette', () => ({
  useCommandPalette: () => ({
    commands: [],
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    registerCommand: vi.fn(),
    unregisterCommand: vi.fn(),
  }),
}))

vi.mock('../src/hooks/usePushNotification', () => ({
  usePushNotification: () => ({
    permission: 'default' as NotificationPermission,
    isSupported: true,
    requestPermission: vi.fn(),
    sendNotification: vi.fn(),
  }),
}))

vi.mock('../src/utils/pushNotification', () => ({
  isSupported: () => true,
  getPermissionStatus: () => 'default',
  requestPermission: vi.fn(),
  showNotification: vi.fn(),
  wasPreviouslyDenied: () => false,
}))

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import Badge from '../src/Badge'
import { SkeletonPulse, SkeletonText, SkeletonCard, SkeletonTable, SkeletonChart, SkeletonImage } from '../src/Skeleton'
import ErrorBoundary, { ErrorFallback } from '../src/ErrorBoundary'
import EmptyState from '../src/EmptyState'
import ThemeToggle from '../src/ThemeToggle'
import ThemeProvider from '../src/ThemeProvider'
import ExportButton from '../src/ExportButton'
import { ErrorPage, NotFoundPage } from '../src/ErrorPage'
import { OptimizedImage } from '../src/OptimizedImage'
import { CommandPalette } from '../src/CommandPalette'
import NotificationBanner from '../src/NotificationBanner'
import type { Command } from '../src/hooks/useCommandPalette'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render and return stable innerHTML for snapshot comparison. */
function snap(ui: React.ReactElement) {
  const { container } = render(ui)
  return container.innerHTML
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

describe('Snapshot: Badge', () => {
  it('renders default badge', () => {
    expect(snap(<Badge label="New" />)).toMatchSnapshot()
  })

  it('renders badge with long label', () => {
    expect(snap(<Badge label="Very Long Label Text" />)).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// Skeleton variants
// ---------------------------------------------------------------------------

describe('Snapshot: Skeleton', () => {
  it('SkeletonPulse default', () => {
    expect(snap(<SkeletonPulse />)).toMatchSnapshot()
  })

  it('SkeletonPulse with custom className', () => {
    expect(snap(<SkeletonPulse className="h-8 w-32" />)).toMatchSnapshot()
  })

  it('SkeletonText single line', () => {
    expect(snap(<SkeletonText lines={1} />)).toMatchSnapshot()
  })

  it('SkeletonText multiple lines', () => {
    expect(snap(<SkeletonText lines={3} />)).toMatchSnapshot()
  })

  it('SkeletonCard default (3 lines)', () => {
    expect(snap(<SkeletonCard />)).toMatchSnapshot()
  })

  it('SkeletonCard with 5 lines', () => {
    expect(snap(<SkeletonCard lines={5} />)).toMatchSnapshot()
  })

  it('SkeletonTable default (5 rows, 4 cols)', () => {
    expect(snap(<SkeletonTable />)).toMatchSnapshot()
  })

  it('SkeletonTable custom (2 rows, 3 cols)', () => {
    expect(snap(<SkeletonTable rows={2} cols={3} />)).toMatchSnapshot()
  })

  it('SkeletonChart default', () => {
    expect(snap(<SkeletonChart />)).toMatchSnapshot()
  })

  it('SkeletonChart custom height', () => {
    expect(snap(<SkeletonChart height={200} />)).toMatchSnapshot()
  })

  it('SkeletonImage default', () => {
    expect(snap(<SkeletonImage />)).toMatchSnapshot()
  })

  it('SkeletonImage with fixed dimensions', () => {
    expect(snap(<SkeletonImage width={300} height={200} rounded={false} />)).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// ErrorBoundary / ErrorFallback
// ---------------------------------------------------------------------------

describe('Snapshot: ErrorFallback', () => {
  it('renders with error message', () => {
    const error = new Error('Test error message')
    expect(snap(<ErrorFallback error={error} onRetry={() => {}} />)).toMatchSnapshot()
  })

  it('renders without error (no message box)', () => {
    expect(snap(<ErrorFallback onRetry={() => {}} />)).toMatchSnapshot()
  })

  it('renders with custom title', () => {
    expect(
      snap(<ErrorFallback title="Custom Error Title" onRetry={() => {}} />),
    ).toMatchSnapshot()
  })

  it('renders without retry button', () => {
    const error = new Error('No retry')
    expect(snap(<ErrorFallback error={error} />)).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

describe('Snapshot: EmptyState', () => {
  it('renders minimal (title only)', () => {
    expect(snap(<EmptyState title="No data found" />)).toMatchSnapshot()
  })

  it('renders with description', () => {
    expect(
      snap(<EmptyState title="Empty" description="Try adding some items." />),
    ).toMatchSnapshot()
  })

  it('renders with custom icon', () => {
    expect(snap(<EmptyState title="No results" icon="🔍" />)).toMatchSnapshot()
  })

  it('renders with action button', () => {
    expect(
      snap(
        <EmptyState
          title="No items"
          description="Get started"
          action={{ label: 'Create', onClick: () => {} }}
        />,
      ),
    ).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// ThemeToggle (wrapped in ThemeProvider)
// ---------------------------------------------------------------------------

describe('Snapshot: ThemeToggle', () => {
  it('renders in light mode', () => {
    expect(
      snap(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      ),
    ).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// ExportButton
// ---------------------------------------------------------------------------

describe('Snapshot: ExportButton', () => {
  it('renders default (closed, with data)', () => {
    const data = [{ name: 'Alice', age: 30 }]
    expect(snap(<ExportButton data={data} />)).toMatchSnapshot()
  })

  it('renders disabled (empty data)', () => {
    expect(snap(<ExportButton data={[]} />)).toMatchSnapshot()
  })

  it('renders with custom label', () => {
    const data = [{ x: 1 }]
    expect(snap(<ExportButton data={data} label="Download" />)).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// ErrorPage
// ---------------------------------------------------------------------------

describe('Snapshot: ErrorPage', () => {
  it('renders with error', () => {
    const error = Object.assign(new Error('Route failed'), { digest: 'abc123' })
    expect(
      snap(<ErrorPage error={error} reset={() => {}} />),
    ).toMatchSnapshot()
  })

  it('renders with custom title and description', () => {
    const error = new Error('Custom')
    expect(
      snap(
        <ErrorPage
          error={error}
          reset={() => {}}
          title="Oops"
          description="Something broke."
        />,
      ),
    ).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// NotFoundPage
// ---------------------------------------------------------------------------

describe('Snapshot: NotFoundPage', () => {
  it('renders default', () => {
    expect(snap(<NotFoundPage />)).toMatchSnapshot()
  })

  it('renders with custom props', () => {
    expect(
      snap(
        <NotFoundPage
          title="Page Missing"
          description="We could not find it."
          homeHref="/home"
        />,
      ),
    ).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// OptimizedImage (initial loading state)
// ---------------------------------------------------------------------------

describe('Snapshot: OptimizedImage', () => {
  it('renders blur placeholder (loading state)', () => {
    expect(
      snap(
        <OptimizedImage
          src="/test.jpg"
          alt="Test image"
          width={800}
          height={600}
        />,
      ),
    ).toMatchSnapshot()
  })

  it('renders shimmer placeholder', () => {
    expect(
      snap(
        <OptimizedImage
          src="/test.jpg"
          alt="Shimmer test"
          width={400}
          height={300}
          placeholder="shimmer"
        />,
      ),
    ).toMatchSnapshot()
  })

  it('renders empty placeholder', () => {
    expect(
      snap(
        <OptimizedImage
          src="/test.jpg"
          alt="No placeholder"
          width={400}
          height={300}
          placeholder="empty"
        />,
      ),
    ).toMatchSnapshot()
  })

  it('renders with priority (eager loading)', () => {
    expect(
      snap(
        <OptimizedImage
          src="/hero.jpg"
          alt="Hero"
          width={1200}
          height={600}
          priority
        />,
      ),
    ).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// CommandPalette (open state with commands)
// ---------------------------------------------------------------------------

describe('Snapshot: CommandPalette', () => {
  it('returns null when closed', () => {
    const { container } = render(
      <CommandPalette commands={[]} isOpen={false} onClose={() => {}} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders open state with commands', () => {
    const commands: Command[] = [
      { id: 'nav-home', label: 'Go to Home', category: 'navigation', shortcut: 'Ctrl+H', handler: () => {} },
      { id: 'action-search', label: 'Search', category: 'action', shortcut: 'Ctrl+/', handler: () => {} },
      { id: 'nav-settings', label: 'Open Settings', category: 'settings', handler: () => {} },
    ]
    expect(
      snap(
        <CommandPalette commands={commands} isOpen={true} onClose={() => {}} />,
      ),
    ).toMatchSnapshot()
  })

  it('renders empty state when no commands match', () => {
    expect(
      snap(
        <CommandPalette commands={[]} isOpen={true} onClose={() => {}} />,
      ),
    ).toMatchSnapshot()
  })
})

// ---------------------------------------------------------------------------
// NotificationBanner
// ---------------------------------------------------------------------------

describe('Snapshot: NotificationBanner', () => {
  beforeEach(() => {
    // Ensure banner becomes visible: permission=default, not dismissed
    window.localStorage.clear()
  })

  it('renders visible banner', () => {
    expect(snap(<NotificationBanner />)).toMatchSnapshot()
  })

  it('renders with custom className', () => {
    expect(snap(<NotificationBanner className="my-custom-class" />)).toMatchSnapshot()
  })
})
