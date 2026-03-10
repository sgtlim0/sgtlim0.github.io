import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useCarousel } from '../src/hooks/useCarousel'
import Carousel from '../src/Carousel'

// ---------------------------------------------------------------------------
// useCarousel hook tests
// ---------------------------------------------------------------------------

describe('useCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // --- initialization ---

  it('starts at index 0 by default', () => {
    const { result } = renderHook(() => useCarousel(5))
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)
  })

  it('starts at provided startIndex', () => {
    const { result } = renderHook(() => useCarousel(5, { startIndex: 2 }))
    expect(result.current.currentIndex).toBe(2)
  })

  it('clamps startIndex to valid range', () => {
    const { result } = renderHook(() => useCarousel(3, { startIndex: 10 }))
    expect(result.current.currentIndex).toBe(2)
  })

  it('clamps negative startIndex to 0', () => {
    const { result } = renderHook(() => useCarousel(3, { startIndex: -5 }))
    expect(result.current.currentIndex).toBe(0)
  })

  it('handles 0 items without error', () => {
    const { result } = renderHook(() => useCarousel(0))
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(true)
  })

  // --- next ---

  it('advances to next slide', () => {
    const { result } = renderHook(() => useCarousel(5))

    act(() => {
      result.current.next()
    })

    expect(result.current.currentIndex).toBe(1)
  })

  it('loops to first slide from last when loop=true (default)', () => {
    const { result } = renderHook(() => useCarousel(3, { startIndex: 2 }))

    act(() => {
      result.current.next()
    })

    expect(result.current.currentIndex).toBe(0)
  })

  it('stays at last slide when loop=false', () => {
    const { result } = renderHook(() => useCarousel(3, { startIndex: 2, loop: false }))

    act(() => {
      result.current.next()
    })

    expect(result.current.currentIndex).toBe(2)
  })

  it('does nothing when itemCount is 0', () => {
    const { result } = renderHook(() => useCarousel(0))

    act(() => {
      result.current.next()
    })

    expect(result.current.currentIndex).toBe(0)
  })

  // --- prev ---

  it('goes to previous slide', () => {
    const { result } = renderHook(() => useCarousel(5, { startIndex: 3 }))

    act(() => {
      result.current.prev()
    })

    expect(result.current.currentIndex).toBe(2)
  })

  it('loops to last slide from first when loop=true', () => {
    const { result } = renderHook(() => useCarousel(4))

    act(() => {
      result.current.prev()
    })

    expect(result.current.currentIndex).toBe(3)
  })

  it('stays at first slide when loop=false', () => {
    const { result } = renderHook(() => useCarousel(4, { loop: false }))

    act(() => {
      result.current.prev()
    })

    expect(result.current.currentIndex).toBe(0)
  })

  // --- goTo ---

  it('goes to a specific index', () => {
    const { result } = renderHook(() => useCarousel(5))

    act(() => {
      result.current.goTo(3)
    })

    expect(result.current.currentIndex).toBe(3)
  })

  it('clamps goTo index to valid range (upper)', () => {
    const { result } = renderHook(() => useCarousel(5))

    act(() => {
      result.current.goTo(100)
    })

    expect(result.current.currentIndex).toBe(4)
  })

  it('clamps goTo index to valid range (lower)', () => {
    const { result } = renderHook(() => useCarousel(5, { startIndex: 3 }))

    act(() => {
      result.current.goTo(-5)
    })

    expect(result.current.currentIndex).toBe(0)
  })

  // --- isFirst / isLast ---

  it('reports isFirst and isLast correctly', () => {
    const { result } = renderHook(() => useCarousel(3))

    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)

    act(() => {
      result.current.goTo(2)
    })

    expect(result.current.isFirst).toBe(false)
    expect(result.current.isLast).toBe(true)
  })

  // --- auto-play ---

  it('auto-plays when autoPlay=true', () => {
    const { result } = renderHook(() =>
      useCarousel(5, { autoPlay: true, interval: 1000 }),
    )

    expect(result.current.isPlaying).toBe(true)
    expect(result.current.currentIndex).toBe(0)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.currentIndex).toBe(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.currentIndex).toBe(2)
  })

  it('does not auto-play when autoPlay=false', () => {
    const { result } = renderHook(() => useCarousel(5))

    expect(result.current.isPlaying).toBe(false)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.currentIndex).toBe(0)
  })

  // --- pause / resume ---

  it('pauses auto-play', () => {
    const { result } = renderHook(() =>
      useCarousel(5, { autoPlay: true, interval: 1000 }),
    )

    act(() => {
      result.current.pause()
    })

    expect(result.current.isPlaying).toBe(false)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.currentIndex).toBe(0)
  })

  it('resumes auto-play after pause', () => {
    const { result } = renderHook(() =>
      useCarousel(5, { autoPlay: true, interval: 1000 }),
    )

    act(() => {
      result.current.pause()
    })

    act(() => {
      result.current.resume()
    })

    expect(result.current.isPlaying).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.currentIndex).toBe(1)
  })

  it('resume does nothing when autoPlay is false', () => {
    const { result } = renderHook(() => useCarousel(5))

    act(() => {
      result.current.resume()
    })

    expect(result.current.isPlaying).toBe(false)
  })

  // --- itemCount change ---

  it('clamps index when itemCount shrinks', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useCarousel(count, { startIndex: 4 }),
      { initialProps: { count: 5 } },
    )

    expect(result.current.currentIndex).toBe(4)

    rerender({ count: 3 })

    expect(result.current.currentIndex).toBe(2)
  })

  it('handles itemCount becoming 0', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useCarousel(count),
      { initialProps: { count: 3 } },
    )

    rerender({ count: 0 })

    expect(result.current.currentIndex).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Carousel component tests
// ---------------------------------------------------------------------------

describe('Carousel', () => {
  const slide1 = <div data-testid="slide-0" key="s0">Slide 1</div>
  const slide2 = <div data-testid="slide-1" key="s1">Slide 2</div>
  const slide3 = <div data-testid="slide-2" key="s2">Slide 3</div>
  const slides = [slide1, slide2, slide3]

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // --- rendering ---

  it('renders all slides', () => {
    render(<Carousel>{slides}</Carousel>)

    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    expect(screen.getByText('Slide 3')).toBeInTheDocument()
  })

  it('returns null when there are no children', () => {
    const { container } = render(<Carousel>{[]}</Carousel>)
    expect(container.innerHTML).toBe('')
  })

  it('does not show arrows or dots for a single slide', () => {
    render(
      <Carousel>
        <div>Only slide</div>
      </Carousel>,
    )

    expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next slide')).not.toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  // --- accessibility ---

  it('has correct ARIA attributes', () => {
    render(<Carousel ariaLabel="Product images">{slides}</Carousel>)

    const region = screen.getByRole('region')
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
    expect(region).toHaveAttribute('aria-label', 'Product images')
  })

  it('marks slides with aria-roledescription and aria-label', () => {
    render(<Carousel>{slides}</Carousel>)

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups).toHaveLength(3)
    expect(slideGroups[0]).toHaveAttribute('aria-roledescription', 'slide')
    expect(slideGroups[0]).toHaveAttribute('aria-label', 'Slide 1 of 3')
    expect(slideGroups[1]).toHaveAttribute('aria-label', 'Slide 2 of 3')
  })

  it('sets aria-hidden on non-active slides', () => {
    render(<Carousel>{slides}</Carousel>)

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[0]).toHaveAttribute('aria-hidden', 'false')
    expect(slideGroups[1]).toHaveAttribute('aria-hidden', 'true')
    expect(slideGroups[2]).toHaveAttribute('aria-hidden', 'true')
  })

  // --- navigation arrows ---

  it('navigates to next slide on arrow click', () => {
    render(<Carousel>{slides}</Carousel>)

    const nextBtn = screen.getByLabelText('Next slide')
    fireEvent.click(nextBtn)

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[1]).toHaveAttribute('aria-hidden', 'false')
  })

  it('navigates to previous slide on arrow click', () => {
    render(<Carousel startIndex={2}>{slides}</Carousel>)

    const prevBtn = screen.getByLabelText('Previous slide')
    fireEvent.click(prevBtn)

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[1]).toHaveAttribute('aria-hidden', 'false')
  })

  it('disables prev arrow on first slide when loop=false', () => {
    render(<Carousel loop={false}>{slides}</Carousel>)

    const prevBtn = screen.getByLabelText('Previous slide')
    expect(prevBtn).toBeDisabled()
  })

  it('disables next arrow on last slide when loop=false', () => {
    render(<Carousel loop={false} startIndex={2}>{slides}</Carousel>)

    const nextBtn = screen.getByLabelText('Next slide')
    expect(nextBtn).toBeDisabled()
  })

  it('hides arrows when showArrows=false', () => {
    render(<Carousel showArrows={false}>{slides}</Carousel>)

    expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next slide')).not.toBeInTheDocument()
  })

  // --- dot indicators ---

  it('renders dot indicators', () => {
    render(<Carousel>{slides}</Carousel>)

    const dots = screen.getAllByRole('tab')
    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
    expect(dots[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('navigates to slide on dot click', () => {
    render(<Carousel>{slides}</Carousel>)

    const dots = screen.getAllByRole('tab')
    fireEvent.click(dots[2])

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[2]).toHaveAttribute('aria-hidden', 'false')
  })

  it('hides dots when showDots=false', () => {
    render(<Carousel showDots={false}>{slides}</Carousel>)

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  // --- keyboard navigation ---

  it('navigates with ArrowRight key', () => {
    render(<Carousel>{slides}</Carousel>)

    const region = screen.getByRole('region')
    fireEvent.keyDown(region, { key: 'ArrowRight' })

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[1]).toHaveAttribute('aria-hidden', 'false')
  })

  it('navigates with ArrowLeft key', () => {
    render(<Carousel startIndex={2}>{slides}</Carousel>)

    const region = screen.getByRole('region')
    fireEvent.keyDown(region, { key: 'ArrowLeft' })

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[1]).toHaveAttribute('aria-hidden', 'false')
  })

  // --- touch swipe ---

  it('swipes left to go to next slide', () => {
    render(<Carousel>{slides}</Carousel>)

    const firstSlide = screen.getAllByRole('group', { hidden: true })[0]

    fireEvent.touchStart(firstSlide, {
      touches: [{ clientX: 200, clientY: 100 }],
    })
    fireEvent.touchEnd(firstSlide, {
      changedTouches: [{ clientX: 100, clientY: 100 }],
    })

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[1]).toHaveAttribute('aria-hidden', 'false')
  })

  it('swipes right to go to previous slide', () => {
    render(<Carousel startIndex={1}>{slides}</Carousel>)

    const slide = screen.getAllByRole('group', { hidden: true })[1]

    fireEvent.touchStart(slide, {
      touches: [{ clientX: 100, clientY: 100 }],
    })
    fireEvent.touchEnd(slide, {
      changedTouches: [{ clientX: 250, clientY: 100 }],
    })

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[0]).toHaveAttribute('aria-hidden', 'false')
  })

  it('ignores vertical swipes', () => {
    render(<Carousel>{slides}</Carousel>)

    const firstSlide = screen.getAllByRole('group', { hidden: true })[0]

    fireEvent.touchStart(firstSlide, {
      touches: [{ clientX: 100, clientY: 100 }],
    })
    fireEvent.touchEnd(firstSlide, {
      changedTouches: [{ clientX: 110, clientY: 300 }],
    })

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[0]).toHaveAttribute('aria-hidden', 'false')
  })

  it('ignores swipes below threshold', () => {
    render(<Carousel swipeThreshold={100}>{slides}</Carousel>)

    const firstSlide = screen.getAllByRole('group', { hidden: true })[0]

    fireEvent.touchStart(firstSlide, {
      touches: [{ clientX: 200, clientY: 100 }],
    })
    fireEvent.touchEnd(firstSlide, {
      changedTouches: [{ clientX: 160, clientY: 100 }],
    })

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[0]).toHaveAttribute('aria-hidden', 'false')
  })

  // --- auto-play ---

  it('auto-plays and advances slides', () => {
    render(
      <Carousel autoPlay interval={2000}>
        {slides}
      </Carousel>,
    )

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[1]).toHaveAttribute('aria-hidden', 'false')
  })

  it('pauses auto-play on hover', () => {
    render(
      <Carousel autoPlay interval={1000}>
        {slides}
      </Carousel>,
    )

    const region = screen.getByRole('region')

    fireEvent.mouseEnter(region)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Should still be on first slide
    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[0]).toHaveAttribute('aria-hidden', 'false')
  })

  it('resumes auto-play on mouse leave', () => {
    render(
      <Carousel autoPlay interval={1000}>
        {slides}
      </Carousel>,
    )

    const region = screen.getByRole('region')

    fireEvent.mouseEnter(region)
    fireEvent.mouseLeave(region)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const slideGroups = screen.getAllByRole('group', { hidden: true })
    expect(slideGroups[1]).toHaveAttribute('aria-hidden', 'false')
  })

  // --- CSS transition ---

  it('applies correct transform style for current slide', () => {
    render(<Carousel startIndex={1} transitionDuration={500}>{slides}</Carousel>)

    const track = screen.getByLabelText('Carousel').querySelector('.flex')
    expect(track).toHaveStyle({ transform: 'translateX(-100%)' })
    expect(track).toHaveStyle({ transition: 'transform 500ms ease-in-out' })
  })

  // --- custom className ---

  it('applies custom className', () => {
    render(<Carousel className="my-custom-class">{slides}</Carousel>)

    const region = screen.getByRole('region')
    expect(region.className).toContain('my-custom-class')
  })
})
