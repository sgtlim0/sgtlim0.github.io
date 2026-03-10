import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RateLimitCard from '../src/admin/RateLimitCard'
import RateLimitDashboard from '../src/admin/RateLimitDashboard'
import type { RateLimitEndpoint } from '../src/admin/RateLimitCard'
import type { RateLimitIncident } from '../src/admin/RateLimitDashboard'

const now = Date.now()

function makeEndpoint(overrides: Partial<RateLimitEndpoint> = {}): RateLimitEndpoint {
  return {
    name: 'chat',
    label: 'Chat',
    limit: 30,
    current: 10,
    windowMs: 60_000,
    resetAt: now + 30_000,
    ...overrides,
  }
}

function makeIncident(overrides: Partial<RateLimitIncident> = {}): RateLimitIncident {
  return {
    time: '2026-03-10 14:32:15',
    endpoint: 'stream',
    ip: '10.0.1.42',
    retryAfterMs: 15_000,
    ...overrides,
  }
}

// --- RateLimitCard ---

describe('RateLimitCard', () => {
  it('should render endpoint label and limit', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ label: 'Login', limit: 5 })} />)
    expect(screen.getByText('Login')).toBeDefined()
    expect(screen.getByText(/최대 5회/)).toBeDefined()
  })

  it('should show current usage and remaining requests', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ current: 12, limit: 30 })} />)
    expect(screen.getByText('12 / 30')).toBeDefined()
    expect(screen.getByText('18')).toBeDefined() // remaining
  })

  it('should render progress bar with correct aria attributes', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ current: 21, limit: 30 })} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar.getAttribute('aria-valuenow')).toBe('70')
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0')
    expect(progressbar.getAttribute('aria-valuemax')).toBe('100')
  })

  it('should display percentage', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ current: 15, limit: 30 })} />)
    const percentTexts = screen.getAllByText('50%')
    expect(percentTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('should show normal status when usage is low', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ current: 5, limit: 30 })} />)
    expect(screen.getByTestId('rate-limit-status').textContent).toBe('정상')
  })

  it('should show warning status when usage is 70%+', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ current: 21, limit: 30 })} />)
    expect(screen.getByTestId('rate-limit-status').textContent).toBe('주의')
  })

  it('should show danger status when at or over limit', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ current: 30, limit: 30 })} />)
    expect(screen.getByTestId('rate-limit-status').textContent).toBe('초과')
  })

  it('should cap percentage at 100% when current exceeds limit', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ current: 35, limit: 30 })} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar.getAttribute('aria-valuenow')).toBe('100')
  })

  it('should display window duration label', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ windowMs: 60_000 })} />)
    expect(screen.getByText(/1분당/)).toBeDefined()
  })

  it('should handle zero limit gracefully', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ current: 0, limit: 0 })} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar.getAttribute('aria-valuenow')).toBe('0')
  })

  it('should use data-testid with endpoint name', () => {
    render(<RateLimitCard endpoint={makeEndpoint({ name: 'login' })} />)
    expect(screen.getByTestId('rate-limit-card-login')).toBeDefined()
  })
})

// --- RateLimitDashboard ---

describe('RateLimitDashboard', () => {
  const mockEndpoints: RateLimitEndpoint[] = [
    makeEndpoint({ name: 'login', label: 'Login', limit: 5, current: 3 }),
    makeEndpoint({ name: 'chat', label: 'Chat', limit: 30, current: 22 }),
    makeEndpoint({ name: 'stream', label: 'Stream', limit: 20, current: 20 }),
    makeEndpoint({ name: 'research', label: 'Research', limit: 10, current: 7 }),
  ]

  const mockIncidents: RateLimitIncident[] = [
    makeIncident({ endpoint: 'stream', ip: '10.0.1.42' }),
    makeIncident({ time: '2026-03-10 14:30:02', endpoint: 'login', ip: '192.168.1.100' }),
  ]

  it('should render header', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    expect(screen.getByText('Rate Limit 모니터링')).toBeDefined()
  })

  it('should render summary stat cards', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    expect(screen.getByText('총 요청 수')).toBeDefined()
    expect(screen.getByText('평균 사용률')).toBeDefined()
    expect(screen.getByText('제한 초과')).toBeDefined()
    expect(screen.getByText('429 에러 (최근)')).toBeDefined()
  })

  it('should compute total requests correctly', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    // 3 + 22 + 20 + 7 = 52
    expect(screen.getByText('52건')).toBeDefined()
  })

  it('should compute average usage correctly', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    // total: 52, capacity: 5+30+20+10 = 65, avg = round(52/65*100) = 80%
    expect(screen.getByText('80%')).toBeDefined()
  })

  it('should show over-limit count', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    // stream is at limit (20/20)
    expect(screen.getByText('1개')).toBeDefined()
  })

  it('should render all endpoint cards', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    expect(screen.getByTestId('rate-limit-card-login')).toBeDefined()
    expect(screen.getByTestId('rate-limit-card-chat')).toBeDefined()
    expect(screen.getByTestId('rate-limit-card-stream')).toBeDefined()
    expect(screen.getByTestId('rate-limit-card-research')).toBeDefined()
  })

  it('should render usage bar chart for all endpoints', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    expect(screen.getByTestId('usage-bar-login')).toBeDefined()
    expect(screen.getByTestId('usage-bar-chat')).toBeDefined()
    expect(screen.getByTestId('usage-bar-stream')).toBeDefined()
    expect(screen.getByTestId('usage-bar-research')).toBeDefined()
  })

  it('should render 429 error history', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    expect(screen.getByText('429 에러 이력')).toBeDefined()
    expect(screen.getByText('10.0.1.42')).toBeDefined()
    expect(screen.getByText('192.168.1.100')).toBeDefined()
  })

  it('should show retry-after in seconds', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    const retryTexts = screen.getAllByText(/Retry: \d+초/)
    expect(retryTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('should filter 429 incidents by endpoint', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    const select = screen.getByLabelText('엔드포인트 필터')
    fireEvent.change(select, { target: { value: 'login' } })
    expect(screen.getByText('192.168.1.100')).toBeDefined()
    expect(screen.queryByText('10.0.1.42')).toBeNull()
  })

  it('should show empty state when filter has no matches', () => {
    render(
      <RateLimitDashboard
        endpoints={mockEndpoints}
        incidents={[makeIncident({ endpoint: 'stream' })]}
      />,
    )
    const select = screen.getByLabelText('엔드포인트 필터')
    fireEvent.change(select, { target: { value: 'login' } })
    expect(screen.getByText('에러 이력이 없습니다.')).toBeDefined()
  })

  it('should render loading state', () => {
    render(<RateLimitDashboard loading />)
    expect(screen.getByTestId('rate-limit-loading')).toBeDefined()
  })

  it('should render error state', () => {
    render(<RateLimitDashboard error="데이터를 불러올 수 없습니다." />)
    expect(screen.getByTestId('rate-limit-error')).toBeDefined()
    expect(screen.getByText('데이터를 불러올 수 없습니다.')).toBeDefined()
  })

  it('should render with default mock data when no props', () => {
    render(<RateLimitDashboard />)
    expect(screen.getByText('Rate Limit 모니터링')).toBeDefined()
    // Default data includes Login and Chat endpoints (multiple matches expected from card + bar + filter)
    expect(screen.getAllByText('Login').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Chat').length).toBeGreaterThanOrEqual(1)
  })

  it('should display incident count', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    expect(screen.getByText('2건')).toBeDefined()
  })

  it('should show filter options for each endpoint', () => {
    render(<RateLimitDashboard endpoints={mockEndpoints} incidents={mockIncidents} />)
    const select = screen.getByLabelText('엔드포인트 필터') as HTMLSelectElement
    const options = select.querySelectorAll('option')
    // 'all' + 4 endpoints = 5
    expect(options.length).toBe(5)
  })
})
