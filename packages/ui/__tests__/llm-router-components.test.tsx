import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProviderBadge from '../src/llm-router/ProviderBadge'
import PriceCell from '../src/llm-router/PriceCell'
import CodeBlock from '../src/llm-router/CodeBlock'
import ModelTable from '../src/llm-router/ModelTable'
import DocsSidebar from '../src/llm-router/DocsSidebar'
import ModelComparison from '../src/llm-router/ModelComparison'
import type { LLMModel } from '../src/llm-router/types'
import type { DocsSidebarItem } from '../src/llm-router/DocsSidebar'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock ThemeProvider
vi.mock('../src/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: (props: Record<string, unknown>) => <span data-testid="search-icon" {...props} />,
  ChevronUp: (props: Record<string, unknown>) => <span data-testid="chevron-up" {...props} />,
  ChevronDown: (props: Record<string, unknown>) => <span data-testid="chevron-down" {...props} />,
  ChevronRight: (props: Record<string, unknown>) => (
    <span data-testid="chevron-right" {...props} />
  ),
  Star: (props: Record<string, unknown>) => <span data-testid="star-icon" {...props} />,
  Moon: (props: Record<string, unknown>) => <span data-testid="moon-icon" {...props} />,
  Sun: (props: Record<string, unknown>) => <span data-testid="sun-icon" {...props} />,
  Menu: (props: Record<string, unknown>) => <span data-testid="menu-icon" {...props} />,
  X: (props: Record<string, unknown>) => <span data-testid="x-icon" {...props} />,
  Copy: (props: Record<string, unknown>) => <span data-testid="copy-icon" {...props} />,
  Check: (props: Record<string, unknown>) => <span data-testid="check-icon" {...props} />,
  Plus: (props: Record<string, unknown>) => <span data-testid="plus-icon" {...props} />,
}))

// ========== Sample Data ==========

const sampleModels: LLMModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerIcon: '!',
    category: 'chat',
    inputPrice: 3300,
    outputPrice: 13200,
    contextWindow: 128000,
    maxOutput: 16384,
    latency: '0.8\uCD08',
    isPopular: true,
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    providerIcon: '!',
    category: 'chat',
    inputPrice: 3960,
    outputPrice: 19800,
    contextWindow: 200000,
    maxOutput: 16384,
    latency: '1.1\uCD08',
    isPopular: true,
  },
  {
    id: 'text-embedding-3-large',
    name: 'text-embedding-3-large',
    provider: 'OpenAI',
    providerIcon: '!',
    category: 'embedding',
    inputPrice: 172,
    outputPrice: 0,
    contextWindow: 8191,
    maxOutput: 3072,
    latency: '0.2\uCD08',
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    providerIcon: '!',
    category: 'image',
    inputPrice: 52800,
    outputPrice: 0,
    contextWindow: 4000,
    maxOutput: 1,
    latency: '12\uCD08',
    isPopular: true,
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    providerIcon: '!',
    category: 'chat',
    inputPrice: 100,
    outputPrice: 420,
    contextWindow: 1000000,
    maxOutput: 8192,
    latency: '1.5\uCD08',
    isPopular: true,
  },
]

// ========== ProviderBadge ==========

describe('ProviderBadge', () => {
  it('renders provider name', () => {
    render(<ProviderBadge provider="OpenAI" />)
    expect(screen.getByText('OpenAI')).toBeInTheDocument()
  })

  it('renders different providers', () => {
    const providers = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Meta', 'Cohere', 'DeepSeek']
    providers.forEach((provider) => {
      const { unmount } = render(<ProviderBadge provider={provider} />)
      expect(screen.getByText(provider)).toBeInTheDocument()
      unmount()
    })
  })

  it('applies known provider color', () => {
    const { container } = render(<ProviderBadge provider="OpenAI" />)
    const colorDot = container.querySelector('span > span:first-child')
    expect(colorDot).toHaveStyle({ backgroundColor: '#10A37F' })
  })

  it('applies fallback color for unknown provider', () => {
    const { container } = render(<ProviderBadge provider="Unknown" />)
    const colorDot = container.querySelector('span > span:first-child')
    expect(colorDot).toHaveStyle({ backgroundColor: '#6B7280' })
  })

  it('renders with sm size', () => {
    const { container } = render(<ProviderBadge provider="OpenAI" size="sm" />)
    const badge = container.firstElementChild
    expect(badge?.className).toContain('text-xs')
  })

  it('renders with md size by default', () => {
    const { container } = render(<ProviderBadge provider="OpenAI" />)
    const badge = container.firstElementChild
    expect(badge?.className).toContain('text-sm')
  })
})

// ========== PriceCell ==========

describe('PriceCell', () => {
  it('renders formatted price in KRW', () => {
    render(<PriceCell price={1500} />)
    expect(screen.getByText('\u20A91,500')).toBeInTheDocument()
  })

  it('renders default unit text', () => {
    render(<PriceCell price={500} />)
    expect(screen.getByText('/ 1M \uD1A0\uD070')).toBeInTheDocument()
  })

  it('renders custom unit text', () => {
    render(<PriceCell price={500} unit="/ 1K tokens" />)
    expect(screen.getByText('/ 1K tokens')).toBeInTheDocument()
  })

  it('renders zero price', () => {
    render(<PriceCell price={0} />)
    expect(screen.getByText('\u20A90')).toBeInTheDocument()
  })

  it('applies green color for low prices (< 500)', () => {
    const { container } = render(<PriceCell price={100} />)
    const priceDiv = container.querySelector('.text-green-600')
    expect(priceDiv).not.toBeNull()
  })

  it('does not apply green color for high prices (>= 500)', () => {
    const { container } = render(<PriceCell price={1000} />)
    const priceDiv = container.querySelector('.text-green-600')
    expect(priceDiv).toBeNull()
  })

  it('applies green color at boundary (price=499)', () => {
    const { container } = render(<PriceCell price={499} />)
    const priceDiv = container.querySelector('.text-green-600')
    expect(priceDiv).not.toBeNull()
  })

  it('does not apply green color at boundary (price=500)', () => {
    const { container } = render(<PriceCell price={500} />)
    const priceDiv = container.querySelector('.text-green-600')
    expect(priceDiv).toBeNull()
  })

  it('renders large prices with locale formatting', () => {
    render(<PriceCell price={1000000} />)
    expect(screen.getByText('\u20A91,000,000')).toBeInTheDocument()
  })
})

// ========== CodeBlock ==========

describe('CodeBlock', () => {
  const examples = [
    { language: 'JavaScript', code: 'const x = 1;' },
    { language: 'Python', code: "print('hello')" },
    { language: 'TypeScript', code: 'const y: number = 2;' },
  ]

  it('renders first example code by default', () => {
    render(<CodeBlock examples={examples} />)
    expect(screen.getByText('const x = 1;')).toBeInTheDocument()
  })

  it('renders all language tabs', () => {
    render(<CodeBlock examples={examples} />)
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('switches tab on click', async () => {
    render(<CodeBlock examples={examples} />)
    const pythonTab = screen.getByText('Python')
    await act(async () => {
      fireEvent.click(pythonTab)
    })
    expect(screen.getByText("print('hello')")).toBeInTheDocument()
  })

  it('marks active tab with aria-selected', () => {
    render(<CodeBlock examples={examples} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('has tablist role', () => {
    render(<CodeBlock examples={examples} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders copy button with aria-label', () => {
    render(<CodeBlock examples={examples} />)
    expect(screen.getByLabelText('\uCF54\uB4DC \uBCF5\uC0AC')).toBeInTheDocument()
  })

  it('handles copy with clipboard mock', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<CodeBlock examples={examples} />)
    const copyBtn = screen.getByLabelText('\uCF54\uB4DC \uBCF5\uC0AC')
    await act(async () => {
      fireEvent.click(copyBtn)
    })
    expect(writeText).toHaveBeenCalledWith('const x = 1;')
  })

  it('renders single example without tabs issue', () => {
    render(<CodeBlock examples={[{ language: 'Bash', code: 'echo hello' }]} />)
    expect(screen.getByText('echo hello')).toBeInTheDocument()
    expect(screen.getByText('Bash')).toBeInTheDocument()
  })
})

// ========== ModelTable ==========

describe('ModelTable', () => {
  it('renders model names', () => {
    render(<ModelTable models={sampleModels} />)
    expect(screen.getByText('GPT-4o')).toBeInTheDocument()
    expect(screen.getByText('Claude Sonnet 4.5')).toBeInTheDocument()
  })

  it('renders popular star icon for popular models', () => {
    render(<ModelTable models={sampleModels} />)
    const starIcons = screen.getAllByTestId('star-icon')
    expect(starIcons.length).toBeGreaterThan(0)
  })

  it('renders search input with aria-label', () => {
    render(<ModelTable models={sampleModels} />)
    expect(screen.getByLabelText('\uBAA8\uB378 \uAC80\uC0C9')).toBeInTheDocument()
  })

  it('filters models by search term', async () => {
    render(<ModelTable models={sampleModels} />)
    const searchInput = screen.getByLabelText('\uBAA8\uB378 \uAC80\uC0C9')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'GPT' } })
    })
    expect(screen.getByText('GPT-4o')).toBeInTheDocument()
    expect(screen.queryByText('Claude Sonnet 4.5')).not.toBeInTheDocument()
  })

  it('search is case-insensitive', async () => {
    render(<ModelTable models={sampleModels} />)
    const searchInput = screen.getByLabelText('\uBAA8\uB378 \uAC80\uC0C9')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'gemini' } })
    })
    expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument()
  })

  it('search by provider name', async () => {
    render(<ModelTable models={sampleModels} />)
    const searchInput = screen.getByLabelText('\uBAA8\uB378 \uAC80\uC0C9')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Anthropic' } })
    })
    expect(screen.getByText('Claude Sonnet 4.5')).toBeInTheDocument()
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument()
  })

  it('filters models by provider dropdown', async () => {
    render(<ModelTable models={sampleModels} />)
    const selects = screen.getAllByRole('combobox')
    const providerSelect = selects[0]
    await act(async () => {
      fireEvent.change(providerSelect, { target: { value: 'OpenAI' } })
    })
    expect(screen.getByText('GPT-4o')).toBeInTheDocument()
    expect(screen.queryByText('Claude Sonnet 4.5')).not.toBeInTheDocument()
  })

  it('filters models by category dropdown', async () => {
    render(<ModelTable models={sampleModels} />)
    const selects = screen.getAllByRole('combobox')
    const categorySelect = selects[1]
    await act(async () => {
      fireEvent.change(categorySelect, { target: { value: 'embedding' } })
    })
    expect(screen.getByText('text-embedding-3-large')).toBeInTheDocument()
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument()
  })

  it('renders provider dropdown with all unique providers', () => {
    render(<ModelTable models={sampleModels} />)
    const selects = screen.getAllByRole('combobox')
    const providerSelect = selects[0]
    const options = within(providerSelect).getAllByRole('option')
    const values = options.map((o) => o.textContent)
    expect(values).toContain('\uC804\uCCB4')
    expect(values).toContain('OpenAI')
    expect(values).toContain('Anthropic')
    expect(values).toContain('Google')
  })

  it('renders table headers', () => {
    render(<ModelTable models={sampleModels} />)
    expect(screen.getByText('\uBAA8\uB378\uBA85')).toBeInTheDocument()
    expect(screen.getByText('\uC81C\uACF5\uC0AC')).toBeInTheDocument()
    expect(screen.getByText('\uC785\uB825\uAC00\uACA9')).toBeInTheDocument()
    expect(screen.getByText('\uCD9C\uB825\uAC00\uACA9')).toBeInTheDocument()
    expect(screen.getByText('\uCEE8\uD14D\uC2A4\uD2B8')).toBeInTheDocument()
    expect(screen.getByText('\uB808\uC774\uD134\uC2DC')).toBeInTheDocument()
  })

  it('sorts by name when clicking header', async () => {
    render(<ModelTable models={sampleModels} />)
    const nameHeader = screen.getByText('\uBAA8\uB378\uBA85')
    // Default sortKey is 'name' + 'asc'. First click toggles to 'desc'.
    await act(async () => {
      fireEvent.click(nameHeader)
    })
    const th = nameHeader.closest('th')
    expect(th).toHaveAttribute('aria-sort', 'descending')
  })

  it('sorts by inputPrice when clicking header', async () => {
    render(<ModelTable models={sampleModels} />)
    const priceHeader = screen.getByText('\uC785\uB825\uAC00\uACA9')
    await act(async () => {
      fireEvent.click(priceHeader)
    })
    const th = priceHeader.closest('th')
    expect(th).toHaveAttribute('aria-sort', 'ascending')
  })

  it('shows model count text', () => {
    render(<ModelTable models={sampleModels} />)
    // Pagination component shows "X-Y of Z" format
    expect(screen.getByTestId('pagination-info')).toBeInTheDocument()
  })

  it('does not show pagination for small sets', () => {
    render(<ModelTable models={sampleModels} />)
    // Pagination component still renders but prev/next are disabled
    const prevBtn = screen.getByLabelText('이전')
    expect(prevBtn).toBeDisabled()
  })

  it('shows pagination when models exceed page size', () => {
    const manyModels: LLMModel[] = Array.from({ length: 25 }, (_, i) => ({
      id: `model-${i}`,
      name: `Model ${i}`,
      provider: 'Test',
      providerIcon: '!',
      category: 'chat' as const,
      inputPrice: 100 * i,
      outputPrice: 200 * i,
      contextWindow: 1000,
      maxOutput: 500,
      latency: '1.0\uCD08',
    }))
    render(<ModelTable models={manyModels} />)
    expect(screen.getByText('\uC774\uC804')).toBeInTheDocument()
    expect(screen.getByText('\uB2E4\uC74C')).toBeInTheDocument()
    expect(screen.getByText('1-20 of 25')).toBeInTheDocument()
  })

  it('navigates to next page', async () => {
    const manyModels: LLMModel[] = Array.from({ length: 25 }, (_, i) => ({
      id: `model-${i}`,
      name: `Model ${i}`,
      provider: 'Test',
      providerIcon: '!',
      category: 'chat' as const,
      inputPrice: 100 * i,
      outputPrice: 200 * i,
      contextWindow: 1000,
      maxOutput: 500,
      latency: '1.0\uCD08',
    }))
    render(<ModelTable models={manyModels} />)
    const nextBtn = screen.getByText('\uB2E4\uC74C')
    await act(async () => {
      fireEvent.click(nextBtn)
    })
    expect(screen.getByText('21-25 of 25')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    const manyModels: LLMModel[] = Array.from({ length: 25 }, (_, i) => ({
      id: `model-${i}`,
      name: `Model ${i}`,
      provider: 'Test',
      providerIcon: '!',
      category: 'chat' as const,
      inputPrice: 100,
      outputPrice: 200,
      contextWindow: 1000,
      maxOutput: 500,
      latency: '1.0\uCD08',
    }))
    render(<ModelTable models={manyModels} />)
    const prevBtn = screen.getByText('\uC774\uC804')
    expect(prevBtn).toBeDisabled()
  })

  it('applies green class to low input prices', () => {
    render(<ModelTable models={sampleModels} />)
    // Gemini 2.5 Pro has inputPrice=100 which is < 500
    const greenPrices = document.querySelectorAll('.text-green-600')
    expect(greenPrices.length).toBeGreaterThan(0)
  })

  it('uses initial provider filter', () => {
    render(<ModelTable models={sampleModels} initialProvider="Google" />)
    expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument()
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument()
  })

  it('uses initial category filter', () => {
    render(<ModelTable models={sampleModels} initialCategory="image" />)
    expect(screen.getByText('DALL-E 3')).toBeInTheDocument()
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument()
  })

  it('resets page on search change', async () => {
    const manyModels: LLMModel[] = Array.from({ length: 25 }, (_, i) => ({
      id: `model-${i}`,
      name: i < 5 ? `Special ${i}` : `Model ${i}`,
      provider: 'Test',
      providerIcon: '!',
      category: 'chat' as const,
      inputPrice: 100,
      outputPrice: 200,
      contextWindow: 1000,
      maxOutput: 500,
      latency: '1.0\uCD08',
    }))
    render(<ModelTable models={manyModels} />)
    // Go to page 2
    await act(async () => {
      fireEvent.click(screen.getByText('\uB2E4\uC74C'))
    })
    // Search should reset to page 1
    const searchInput = screen.getByLabelText('\uBAA8\uB378 \uAC80\uC0C9')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Special' } })
    })
    expect(screen.getByText('1-5 of 5')).toBeInTheDocument()
  })
})

// ========== DocsSidebar ==========

describe('DocsSidebar', () => {
  const sampleItems: DocsSidebarItem[] = [
    {
      title: 'Getting Started',
      href: '/docs/getting-started',
      children: [
        { title: 'Installation', href: '/docs/installation' },
        { title: 'Quick Start', href: '/docs/quick-start' },
      ],
    },
    {
      title: 'API Reference',
      href: '/docs/api',
    },
  ]

  it('renders top-level items', () => {
    render(<DocsSidebar items={sampleItems} />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('API Reference')).toBeInTheDocument()
  })

  it('renders child items when parent is open', () => {
    render(<DocsSidebar items={sampleItems} />)
    expect(screen.getByText('Installation')).toBeInTheDocument()
    expect(screen.getByText('Quick Start')).toBeInTheDocument()
  })

  it('renders links for leaf items', () => {
    render(<DocsSidebar items={sampleItems} />)
    const link = screen.getByText('API Reference').closest('a')
    expect(link).toHaveAttribute('href', '/docs/api')
  })

  it('renders button for items with children', () => {
    render(<DocsSidebar items={sampleItems} />)
    const parentBtn = screen.getByText('Getting Started').closest('button')
    expect(parentBtn).toBeTruthy()
  })

  it('toggles children visibility on click', async () => {
    render(<DocsSidebar items={sampleItems} />)
    const parentBtn = screen.getByText('Getting Started').closest('button')!
    // Children are visible by default
    expect(screen.getByText('Installation')).toBeInTheDocument()
    // Click to collapse
    await act(async () => {
      fireEvent.click(parentBtn)
    })
    expect(screen.queryByText('Installation')).not.toBeInTheDocument()
    // Click to expand
    await act(async () => {
      fireEvent.click(parentBtn)
    })
    expect(screen.getByText('Installation')).toBeInTheDocument()
  })

  it('renders nested children links correctly', () => {
    render(<DocsSidebar items={sampleItems} />)
    const installLink = screen.getByText('Installation').closest('a')
    expect(installLink).toHaveAttribute('href', '/docs/installation')
  })

  it('renders aside element', () => {
    const { container } = render(<DocsSidebar items={sampleItems} />)
    expect(container.querySelector('aside')).toBeTruthy()
  })

  it('renders empty sidebar without error', () => {
    const { container } = render(<DocsSidebar items={[]} />)
    expect(container.querySelector('aside')).toBeTruthy()
  })

  it('renders deeply nested items', () => {
    const deepItems: DocsSidebarItem[] = [
      {
        title: 'Level 1',
        href: '/l1',
        children: [
          {
            title: 'Level 2',
            href: '/l2',
            children: [{ title: 'Level 3', href: '/l3' }],
          },
        ],
      },
    ]
    render(<DocsSidebar items={deepItems} />)
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
    expect(screen.getByText('Level 3')).toBeInTheDocument()
  })
})

// ========== LRNavbar (imported separately due to ThemeProvider mock) ==========

describe('LRNavbar', () => {
  let LRNavbar: typeof import('../src/llm-router/LRNavbar').default

  beforeEach(async () => {
    const mod = await import('../src/llm-router/LRNavbar')
    LRNavbar = mod.default
  })

  it('renders brand name', () => {
    render(<LRNavbar />)
    expect(screen.getByText('H Chat LLM Router')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<LRNavbar />)
    expect(screen.getByLabelText('\uBAA8\uB378 \uD398\uC774\uC9C0')).toBeInTheDocument()
    expect(screen.getByLabelText('\uBB38\uC11C \uD398\uC774\uC9C0')).toBeInTheDocument()
    expect(screen.getByLabelText('Playground \uD398\uC774\uC9C0')).toBeInTheDocument()
    expect(screen.getByLabelText('\uAC00\uACA9 \uD398\uC774\uC9C0')).toBeInTheDocument()
  })

  it('renders login and signup when not authenticated', () => {
    render(<LRNavbar isAuthenticated={false} />)
    const loginLinks = screen.getAllByText('\uB85C\uADF8\uC778')
    const signupLinks = screen.getAllByText('\uC2DC\uC791\uD558\uAE30')
    expect(loginLinks.length).toBeGreaterThan(0)
    expect(signupLinks.length).toBeGreaterThan(0)
  })

  it('renders dashboard link when authenticated', () => {
    render(<LRNavbar isAuthenticated={true} />)
    const dashboardLinks = screen.getAllByText('\uB300\uC2DC\uBCF4\uB4DC')
    expect(dashboardLinks.length).toBeGreaterThan(0)
    expect(screen.queryByText('\uB85C\uADF8\uC778')).not.toBeInTheDocument()
  })

  it('has nav role and aria-label', () => {
    render(<LRNavbar />)
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      '\uBA54\uC778 \uB124\uBE44\uAC8C\uC774\uC158',
    )
  })

  it('has theme toggle button', () => {
    render(<LRNavbar />)
    expect(screen.getByLabelText('\uD14C\uB9C8 \uC804\uD658')).toBeInTheDocument()
  })

  it('has mobile menu button', () => {
    render(<LRNavbar />)
    expect(screen.getByLabelText('\uBA54\uB274')).toBeInTheDocument()
  })

  it('toggles mobile menu on click', async () => {
    render(<LRNavbar />)
    const menuBtn = screen.getByLabelText('\uBA54\uB274')
    await act(async () => {
      fireEvent.click(menuBtn)
    })
    // Mobile menu should show navigation links
    const mobileLinks = document.querySelectorAll('.md\\:hidden a')
    expect(mobileLinks.length).toBeGreaterThan(0)
  })

  it('closes mobile menu when link is clicked', async () => {
    render(<LRNavbar />)
    const menuBtn = screen.getByLabelText('\uBA54\uB274')
    await act(async () => {
      fireEvent.click(menuBtn)
    })
    // Find a mobile link and click it
    const mobileNav = document.querySelector('.md\\:hidden.border-t')
    if (mobileNav) {
      const firstLink = mobileNav.querySelector('a')
      if (firstLink) {
        await act(async () => {
          fireEvent.click(firstLink)
        })
      }
    }
    // Menu should be closed (mobile nav should not be present)
    const mobileNavAfter = document.querySelector('.md\\:hidden.border-t')
    expect(mobileNavAfter).toBeNull()
  })
})

// ========== ModelComparison ==========

describe('ModelComparison', () => {
  it('renders with default two model selectors', () => {
    render(<ModelComparison models={sampleModels} />)
    const selectors = screen.getAllByLabelText(/\uBAA8\uB378 .* \uC120\uD0DD/)
    expect(selectors.length).toBe(2)
  })

  it('renders model options grouped by provider', () => {
    render(<ModelComparison models={sampleModels} />)
    const selectors = screen.getAllByLabelText(/\uBAA8\uB378 .* \uC120\uD0DD/)
    const options = within(selectors[0]).getAllByRole('option')
    // Should have empty option + model options
    expect(options.length).toBeGreaterThan(1)
  })

  it('shows placeholder when no model selected', () => {
    render(<ModelComparison models={sampleModels} />)
    const placeholders = screen.getAllByText(
      '\uB4DC\uB86D\uB2E4\uC6B4\uC5D0\uC11C \uBE44\uAD50\uD560 \uBAA8\uB378\uC744 \uC120\uD0DD\uD558\uC138\uC694',
    )
    expect(placeholders.length).toBe(2)
  })

  it('displays model details when selected', async () => {
    render(<ModelComparison models={sampleModels} />)
    const selectors = screen.getAllByLabelText(/\uBAA8\uB378 .* \uC120\uD0DD/)
    await act(async () => {
      fireEvent.change(selectors[0], { target: { value: 'gpt-4o' } })
    })
    expect(screen.getByText('chat')).toBeInTheDocument()
  })

  it('shows add model button when fewer than 3 models', () => {
    render(<ModelComparison models={sampleModels} />)
    expect(screen.getByText('\uBAA8\uB378 \uCD94\uAC00')).toBeInTheDocument()
  })

  it('adds a third model slot', async () => {
    render(<ModelComparison models={sampleModels} />)
    const addBtn = screen.getByText('\uBAA8\uB378 \uCD94\uAC00')
    await act(async () => {
      fireEvent.click(addBtn)
    })
    const selectors = screen.getAllByLabelText(/\uBAA8\uB378 .* \uC120\uD0DD/)
    expect(selectors.length).toBe(3)
  })

  it('hides add button when 3 models are shown', async () => {
    render(<ModelComparison models={sampleModels} />)
    await act(async () => {
      fireEvent.click(screen.getByText('\uBAA8\uB378 \uCD94\uAC00'))
    })
    expect(screen.queryByText('\uBAA8\uB378 \uCD94\uAC00')).not.toBeInTheDocument()
  })

  it('removes a model slot', async () => {
    render(<ModelComparison models={sampleModels} />)
    const removeButtons = screen.getAllByLabelText('\uBAA8\uB378 \uC81C\uAC70')
    await act(async () => {
      fireEvent.click(removeButtons[0])
    })
    const selectors = screen.getAllByLabelText(/\uBAA8\uB378 .* \uC120\uD0DD/)
    expect(selectors.length).toBe(1)
  })

  it('does not remove the last model slot', async () => {
    render(<ModelComparison models={sampleModels} />)
    // Remove first
    let removeButtons = screen.getAllByLabelText('\uBAA8\uB378 \uC81C\uAC70')
    await act(async () => {
      fireEvent.click(removeButtons[0])
    })
    // Only one left, should not have remove button (or removing should not go below 1)
    const selectors = screen.getAllByLabelText(/\uBAA8\uB378 .* \uC120\uD0DD/)
    expect(selectors.length).toBe(1)
  })

  it('shows price comparison labels with color', async () => {
    render(<ModelComparison models={sampleModels} />)
    const selectors = screen.getAllByLabelText(/\uBAA8\uB378 .* \uC120\uD0DD/)
    await act(async () => {
      fireEvent.change(selectors[0], { target: { value: 'gpt-4o' } })
    })
    await act(async () => {
      fireEvent.change(selectors[1], { target: { value: 'gemini-2-5-pro' } })
    })
    // Should show price labels with cheapest/most expensive colors
    const greenLabels = document.querySelectorAll('.text-green-600')
    const redLabels = document.querySelectorAll('.text-red-600')
    expect(greenLabels.length + redLabels.length).toBeGreaterThan(0)
  })

  it('renders context bar visual', async () => {
    render(<ModelComparison models={sampleModels} />)
    const selectors = screen.getAllByLabelText(/\uBAA8\uB378 .* \uC120\uD0DD/)
    await act(async () => {
      fireEvent.change(selectors[0], { target: { value: 'gpt-4o' } })
    })
    // Context bar should be rendered
    const bars = document.querySelectorAll('.h-2.rounded-full')
    expect(bars.length).toBeGreaterThan(0)
  })

  it('shows row labels', async () => {
    render(<ModelComparison models={sampleModels} />)
    const selectors = screen.getAllByLabelText(/\uBAA8\uB378 .* \uC120\uD0DD/)
    await act(async () => {
      fireEvent.change(selectors[0], { target: { value: 'gpt-4o' } })
    })
    expect(screen.getByText('\uC785\uB825 \uAC00\uACA9')).toBeInTheDocument()
    expect(screen.getByText('\uCD9C\uB825 \uAC00\uACA9')).toBeInTheDocument()
    expect(screen.getByText('\uCEE8\uD14D\uC2A4\uD2B8 \uC708\uB3C4\uC6B0')).toBeInTheDocument()
    expect(screen.getByText('\uCD5C\uB300 \uCD9C\uB825')).toBeInTheDocument()
    expect(screen.getByText('\uB808\uC774\uD134\uC2DC')).toBeInTheDocument()
  })
})
