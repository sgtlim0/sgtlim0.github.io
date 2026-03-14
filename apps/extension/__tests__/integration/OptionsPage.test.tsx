import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OptionsPage } from '../../src/options/OptionsPage'
import { DEFAULT_SETTINGS } from '../../src/types/settings'
import * as storage from '../../src/utils/storage'

// Mock the storage utilities
vi.mock('../../src/utils/storage', async () => {
  const actual = await vi.importActual('../../src/utils/storage')
  return {
    ...actual,
    getSettings: vi.fn(),
    setSettings: vi.fn(),
  }
})

describe('OptionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(storage.getSettings).mockResolvedValue(DEFAULT_SETTINGS)
    vi.mocked(storage.setSettings).mockResolvedValue(DEFAULT_SETTINGS)
  })

  describe('초기 렌더링', () => {
    it('should render page title and description', () => {
      render(<OptionsPage />)

      expect(screen.getByText('H Chat 설정')).toBeInTheDocument()
      expect(screen.getByText('Chrome Extension의 동작 방식을 설정합니다.')).toBeInTheDocument()
    })

    it('should render all section headers', () => {
      render(<OptionsPage />)

      expect(screen.getByText('테마')).toBeInTheDocument()
      expect(screen.getByText('언어')).toBeInTheDocument()
      expect(screen.getByText('API 설정')).toBeInTheDocument()
      expect(screen.getByText('기능 설정')).toBeInTheDocument()
    })

    it('should load settings on mount', async () => {
      render(<OptionsPage />)

      await waitFor(() => {
        expect(storage.getSettings).toHaveBeenCalledTimes(1)
      })
    })

    it('should display default settings initially', async () => {
      render(<OptionsPage />)

      await waitFor(() => {
        // Theme: system is checked
        const systemThemeRadio = screen.getByRole('radio', {
          name: /시스템 설정/,
        })
        expect(systemThemeRadio).toBeChecked()

        // Language: ko is checked
        const koLangRadio = screen.getByRole('radio', { name: /한국어/ })
        expect(koLangRadio).toBeChecked()
      })
    })
  })

  describe('테마 설정', () => {
    it('should select light theme', async () => {
      render(<OptionsPage />)

      const lightThemeRadio = screen.getByRole('radio', {
        name: /라이트 모드/,
      })
      fireEvent.click(lightThemeRadio)

      await waitFor(() => {
        expect(lightThemeRadio).toBeChecked()
      })
    })

    it('should select dark theme', async () => {
      render(<OptionsPage />)

      const darkThemeRadio = screen.getByRole('radio', { name: /다크 모드/ })
      fireEvent.click(darkThemeRadio)

      await waitFor(() => {
        expect(darkThemeRadio).toBeChecked()
      })
    })

    it('should have system theme checked by default', async () => {
      render(<OptionsPage />)

      await waitFor(() => {
        const systemThemeRadio = screen.getByRole('radio', {
          name: /시스템 설정/,
        })
        expect(systemThemeRadio).toBeChecked()
      })
    })
  })

  describe('언어 설정', () => {
    it('should select Korean language', async () => {
      render(<OptionsPage />)

      const koRadio = screen.getByRole('radio', { name: /한국어/ })
      fireEvent.click(koRadio)

      await waitFor(() => {
        expect(koRadio).toBeChecked()
      })
    })

    it('should select English language', async () => {
      render(<OptionsPage />)

      const enRadio = screen.getByRole('radio', { name: /English/ })
      fireEvent.click(enRadio)

      await waitFor(() => {
        expect(enRadio).toBeChecked()
      })
    })

    it('should display language descriptions', () => {
      render(<OptionsPage />)

      expect(screen.getByText('인터페이스를 한국어로 표시합니다')).toBeInTheDocument()
      expect(screen.getByText('Display interface in English')).toBeInTheDocument()
    })
  })

  describe('API 설정', () => {
    it('should display API base URL input', () => {
      render(<OptionsPage />)

      const urlInput = screen.getByLabelText('API Base URL')
      expect(urlInput).toBeInTheDocument()
      expect(urlInput).toHaveValue(DEFAULT_SETTINGS.apiBaseUrl)
    })

    it('should update API base URL', async () => {
      render(<OptionsPage />)

      const urlInput = screen.getByLabelText('API Base URL')
      fireEvent.change(urlInput, {
        target: { value: 'https://custom.api.com' },
      })

      await waitFor(() => {
        expect(urlInput).toHaveValue('https://custom.api.com')
      })
    })

    it('should display max text length input', () => {
      render(<OptionsPage />)

      const lengthInput = screen.getByLabelText('최대 텍스트 길이')
      expect(lengthInput).toBeInTheDocument()
      expect(lengthInput).toHaveValue(DEFAULT_SETTINGS.maxTextLength)
    })

    it('should update max text length', async () => {
      render(<OptionsPage />)

      const lengthInput = screen.getByLabelText('최대 텍스트 길이')
      fireEvent.change(lengthInput, { target: { value: '10000' } })

      await waitFor(() => {
        expect(lengthInput).toHaveValue(10000)
      })
    })

    it('should have min and max constraints on text length input', () => {
      render(<OptionsPage />)

      const lengthInput = screen.getByLabelText('최대 텍스트 길이')
      expect(lengthInput).toHaveAttribute('min', '100')
      expect(lengthInput).toHaveAttribute('max', '50000')
    })
  })

  describe('저장 기능', () => {
    it('should save settings on save button click', async () => {
      render(<OptionsPage />)

      const saveButton = screen.getByRole('button', { name: /저장/ })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(storage.setSettings).toHaveBeenCalledTimes(1)
        expect(storage.setSettings).toHaveBeenCalledWith(DEFAULT_SETTINGS)
      })
    })

    it('should show success message after successful save', async () => {
      render(<OptionsPage />)

      const saveButton = screen.getByRole('button', { name: /저장/ })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('설정이 저장되었습니다.')).toBeInTheDocument()
      })
    })

    it('should disable save button while saving', async () => {
      vi.mocked(storage.setSettings).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(DEFAULT_SETTINGS), 100)),
      )

      render(<OptionsPage />)

      const saveButton = screen.getByRole('button', { name: /저장/ })
      fireEvent.click(saveButton)

      expect(saveButton).toBeDisabled()
      expect(screen.getByText('저장 중...')).toBeInTheDocument()

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('should show error message on save failure', async () => {
      vi.mocked(storage.setSettings).mockRejectedValueOnce(new Error('Save failed'))

      render(<OptionsPage />)

      const saveButton = screen.getByRole('button', { name: /저장/ })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('저장 중 오류가 발생했습니다.')).toBeInTheDocument()
      })
    })

    it('should save modified theme setting', async () => {
      render(<OptionsPage />)

      await waitFor(() => {
        expect(storage.getSettings).toHaveBeenCalled()
      })

      const darkThemeRadio = screen.getByRole('radio', { name: /다크 모드/ })
      fireEvent.click(darkThemeRadio)

      await waitFor(() => {
        expect(darkThemeRadio).toBeChecked()
      })

      const saveButton = screen.getByRole('button', { name: /저장/ })
      fireEvent.click(saveButton)

      await waitFor(
        () => {
          expect(storage.setSettings).toHaveBeenCalledWith(
            expect.objectContaining({
              theme: 'dark',
            }),
          )
        },
        { timeout: 10000 },
      )
    })
  })

  describe('재설정 기능', () => {
    it('should render reset button', () => {
      render(<OptionsPage />)

      expect(screen.getByRole('button', { name: /기본값으로 재설정/ })).toBeInTheDocument()
    })

    it('should reset API URL to default', async () => {
      render(<OptionsPage />)

      const urlInput = screen.getByLabelText('API Base URL')
      fireEvent.change(urlInput, {
        target: { value: 'https://changed.com' },
      })

      await waitFor(() => {
        expect(urlInput).toHaveValue('https://changed.com')
      })

      const resetButton = screen.getByRole('button', {
        name: /기본값으로 재설정/,
      })
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(urlInput).toHaveValue(DEFAULT_SETTINGS.apiBaseUrl)
      })
    })
  })

  describe('통합 시나리오', () => {
    it('should load and save settings workflow', async () => {
      render(<OptionsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(storage.getSettings).toHaveBeenCalled()
      })

      // Click save with default settings
      const saveButton = screen.getByRole('button', { name: /저장/ })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(storage.setSettings).toHaveBeenCalledWith(DEFAULT_SETTINGS)
        expect(screen.getByText('설정이 저장되었습니다.')).toBeInTheDocument()
      })
    })

    it('should display all interactive elements', () => {
      render(<OptionsPage />)

      // Buttons
      expect(screen.getByRole('button', { name: /저장/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /기본값으로 재설정/ })).toBeInTheDocument()

      // Inputs
      expect(screen.getByLabelText('API Base URL')).toBeInTheDocument()
      expect(screen.getByLabelText('최대 텍스트 길이')).toBeInTheDocument()

      // Radio groups for theme and language
      const themeRadios = screen.getAllByRole('radio', { name: /모드|설정/ })
      expect(themeRadios.length).toBeGreaterThanOrEqual(3)

      const langRadios = screen.getAllByRole('radio', {
        name: /한국어|English/,
      })
      expect(langRadios).toHaveLength(2)
    })
  })

  describe('UI 요소 존재 확인', () => {
    it('should render all theme options', () => {
      render(<OptionsPage />)

      expect(screen.getByText('라이트 모드')).toBeInTheDocument()
      expect(screen.getByText('다크 모드')).toBeInTheDocument()
      expect(screen.getByText('시스템 설정')).toBeInTheDocument()
    })

    it('should render all language options', () => {
      render(<OptionsPage />)

      expect(screen.getByText('한국어')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('should render API settings section', () => {
      render(<OptionsPage />)

      expect(screen.getByText('API 모드')).toBeInTheDocument()
      expect(screen.getByText('API Base URL')).toBeInTheDocument()
      expect(screen.getByText('최대 텍스트 길이')).toBeInTheDocument()
    })

    it('should render feature toggles section', () => {
      render(<OptionsPage />)

      expect(screen.getByText('자동 새니타이즈')).toBeInTheDocument()
      expect(screen.getByText('사이드 패널 활성화')).toBeInTheDocument()
      expect(screen.getByText('키보드 단축키')).toBeInTheDocument()
    })
  })
})
