import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import I18nProvider, { useI18n } from '../src/i18n/I18nProvider'
import LanguageToggle from '../src/i18n/LanguageToggle'

function I18nConsumer() {
  const { locale, t } = useI18n()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="title">{t('hero.title')}</span>
    </div>
  )
}

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render children', () => {
    render(
      <I18nProvider>
        <span>Child</span>
      </I18nProvider>,
    )
    expect(screen.getByText('Child')).toBeDefined()
  })

  it('should provide locale context', () => {
    render(
      <I18nProvider>
        <I18nConsumer />
      </I18nProvider>,
    )
    expect(screen.getByTestId('locale').textContent).toBe('ko')
  })

  it('should translate keys', () => {
    render(
      <I18nProvider>
        <I18nConsumer />
      </I18nProvider>,
    )
    const title = screen.getByTestId('title').textContent
    expect(title).toBeDefined()
    expect(title!.length).toBeGreaterThan(0)
  })
})

describe('LanguageToggle', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render toggle button', () => {
    render(
      <I18nProvider>
        <LanguageToggle />
      </I18nProvider>,
    )
    expect(screen.getByText('EN')).toBeDefined()
  })

  it('should toggle language on click', () => {
    render(
      <I18nProvider>
        <LanguageToggle />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByText('EN'))
    expect(screen.getByText('KO')).toBeDefined()
    expect(localStorage.getItem('locale')).toBe('en')
  })

  it('should toggle back to Korean', () => {
    render(
      <I18nProvider>
        <LanguageToggle />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByText('EN'))
    fireEvent.click(screen.getByText('KO'))
    expect(screen.getByText('EN')).toBeDefined()
    expect(localStorage.getItem('locale')).toBe('ko')
  })
})

describe('useI18n', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return translation function', () => {
    function TestComponent() {
      const { t } = useI18n()
      return <span>{t('hero.title')}</span>
    }

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>,
    )
    expect(screen.getByText(/.+/)).toBeDefined()
  })

  it('should return key when translation missing', () => {
    function TestComponent() {
      const { t } = useI18n()
      return <span>{t('nonexistent.key' as never)}</span>
    }

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>,
    )
    expect(screen.getByText('nonexistent.key')).toBeDefined()
  })
})
