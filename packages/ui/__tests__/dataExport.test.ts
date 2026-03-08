import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  downloadBlob,
  exportToCSV,
  exportToJSON,
  formatDataForExport,
  buildCsvString,
} from '../src/utils/dataExport'

// ── Utility tests ──────────────────────────────────────────────────────

describe('dataExport utilities', () => {
  // ── downloadBlob ─────────────────────────────────────────────────────

  describe('downloadBlob', () => {
    it('creates an anchor element, clicks it, and revokes the object URL', () => {
      const mockUrl = 'blob:http://localhost/fake-url'
      const originalCreateObjectURL = URL.createObjectURL
      const originalRevokeObjectURL = URL.revokeObjectURL
      URL.createObjectURL = vi.fn(() => mockUrl)
      URL.revokeObjectURL = vi.fn()

      const clickSpy = vi.fn()
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: clickSpy,
        style: {},
      } as unknown as HTMLAnchorElement)

      const blob = new Blob(['hello'], { type: 'text/plain' })
      downloadBlob(blob, 'test.txt')

      expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
      expect(clickSpy).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl)

      createElementSpy.mockRestore()
      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
    })

    it('is SSR-safe (no-op when document is unavailable)', () => {
      const originalDocument = globalThis.document
      // @ts-expect-error -- testing SSR
      delete globalThis.document

      expect(() => {
        downloadBlob(new Blob(['x']), 'test.txt')
      }).not.toThrow()

      globalThis.document = originalDocument
    })
  })

  // ── buildCsvString (pure function, no browser APIs) ──────────────────

  describe('buildCsvString', () => {
    it('generates CSV with all columns when none specified', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ]
      const csv = buildCsvString(data)
      expect(csv).toContain('name,age')
      expect(csv).toContain('Alice,30')
      expect(csv).toContain('Bob,25')
    })

    it('generates CSV with specified columns only', () => {
      const data = [{ name: 'Alice', age: 30, email: 'a@b.c' }]
      const csv = buildCsvString(data, ['name', 'age'])
      expect(csv).toContain('name,age')
      expect(csv).not.toContain('email')
    })

    it('includes UTF-8 BOM for Excel compatibility', () => {
      const data = [{ col: 'value' }]
      const csv = buildCsvString(data)
      expect(csv.charCodeAt(0)).toBe(0xfeff)
    })

    it('handles Korean characters', () => {
      const data = [{ name: '홍길동', dept: '개발팀' }]
      const csv = buildCsvString(data)
      expect(csv).toContain('홍길동')
      expect(csv).toContain('개발팀')
    })

    it('escapes fields containing commas', () => {
      const data = [{ description: 'one, two, three' }]
      const csv = buildCsvString(data)
      expect(csv).toContain('"one, two, three"')
    })

    it('escapes fields containing double quotes', () => {
      const data = [{ note: 'He said "hello"' }]
      const csv = buildCsvString(data)
      expect(csv).toContain('"He said ""hello"""')
    })

    it('escapes fields containing newlines', () => {
      const data = [{ note: 'line1\nline2' }]
      const csv = buildCsvString(data)
      expect(csv).toContain('"line1\nline2"')
    })

    it('returns empty string for empty data array', () => {
      const csv = buildCsvString([])
      expect(csv).toBe('')
    })

    it('formats Date values as ISO strings', () => {
      const date = new Date('2025-06-15T10:30:00.000Z')
      const data = [{ created: date }]
      const csv = buildCsvString(data)
      expect(csv).toContain('2025-06-15')
    })

    it('handles null and undefined values', () => {
      const data = [{ a: null, b: undefined, c: 'ok' }]
      const csv = buildCsvString(data)
      expect(csv).toContain(',,ok')
    })

    it('handles numeric values correctly', () => {
      const data = [{ count: 42, rate: 3.14 }]
      const csv = buildCsvString(data)
      expect(csv).toContain('42')
      expect(csv).toContain('3.14')
    })

    it('handles boolean values', () => {
      const data = [{ active: true, deleted: false }]
      const csv = buildCsvString(data)
      expect(csv).toContain('true')
      expect(csv).toContain('false')
    })

    it('uses CRLF line endings', () => {
      const data = [{ a: '1' }]
      const csv = buildCsvString(data)
      // Remove BOM, split by CRLF
      const withoutBom = csv.slice(1)
      expect(withoutBom).toContain('\r\n')
    })
  })

  // ── exportToCSV ──────────────────────────────────────────────────────

  describe('exportToCSV', () => {
    let clickSpy: ReturnType<typeof vi.fn>
    let createElementSpy: ReturnType<typeof vi.spyOn>
    let originalCreateObjectURL: typeof URL.createObjectURL
    let originalRevokeObjectURL: typeof URL.revokeObjectURL

    beforeEach(() => {
      clickSpy = vi.fn()
      originalCreateObjectURL = URL.createObjectURL
      originalRevokeObjectURL = URL.revokeObjectURL
      URL.createObjectURL = vi.fn(() => 'blob:mock')
      URL.revokeObjectURL = vi.fn()
      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: clickSpy,
        style: {},
      } as unknown as HTMLAnchorElement)
    })

    afterEach(() => {
      createElementSpy.mockRestore()
      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
    })

    it('calls downloadBlob with csv blob', () => {
      const data = [{ name: 'Alice' }]
      exportToCSV(data, 'users.csv')
      expect(clickSpy).toHaveBeenCalledOnce()
    })

    it('does not download for empty data', () => {
      exportToCSV([], 'empty.csv')
      expect(clickSpy).not.toHaveBeenCalled()
    })
  })

  // ── exportToJSON ─────────────────────────────────────────────────────

  describe('exportToJSON', () => {
    let clickSpy: ReturnType<typeof vi.fn>
    let createElementSpy: ReturnType<typeof vi.spyOn>
    let originalCreateObjectURL: typeof URL.createObjectURL
    let originalRevokeObjectURL: typeof URL.revokeObjectURL

    beforeEach(() => {
      clickSpy = vi.fn()
      originalCreateObjectURL = URL.createObjectURL
      originalRevokeObjectURL = URL.revokeObjectURL
      URL.createObjectURL = vi.fn(() => 'blob:mock')
      URL.revokeObjectURL = vi.fn()
      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: clickSpy,
        style: {},
      } as unknown as HTMLAnchorElement)
    })

    afterEach(() => {
      createElementSpy.mockRestore()
      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
    })

    it('exports data as pretty-printed JSON', () => {
      const data = { users: [{ name: 'Alice' }] }
      exportToJSON(data, 'data.json')
      expect(clickSpy).toHaveBeenCalledOnce()
    })

    it('exports arrays', () => {
      exportToJSON([1, 2, 3], 'arr.json')
      expect(clickSpy).toHaveBeenCalledOnce()
    })

    it('handles null data', () => {
      exportToJSON(null, 'null.json')
      expect(clickSpy).toHaveBeenCalledOnce()
    })
  })

  // ── formatDataForExport ──────────────────────────────────────────────

  describe('formatDataForExport', () => {
    it('formats data according to column config', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ]
      const columns = [
        { key: 'name', header: 'Name' },
        { key: 'age', header: 'Age' },
      ]
      const result = formatDataForExport(data, columns)
      expect(result).toEqual([
        ['Name', 'Age'],
        ['Alice', '30'],
        ['Bob', '25'],
      ])
    })

    it('uses formatter when provided', () => {
      const data = [{ amount: 1234.56 }]
      const columns = [
        { key: 'amount', header: 'Amount', formatter: (v: unknown) => `$${Number(v).toFixed(2)}` },
      ]
      const result = formatDataForExport(data, columns)
      expect(result).toEqual([['Amount'], ['$1234.56']])
    })

    it('returns only headers for empty data', () => {
      const columns = [{ key: 'a', header: 'A' }]
      const result = formatDataForExport([], columns)
      expect(result).toEqual([['A']])
    })

    it('handles missing keys gracefully', () => {
      const data = [{ name: 'Alice' }]
      const columns = [
        { key: 'name', header: 'Name' },
        { key: 'missing', header: 'Missing' },
      ]
      const result = formatDataForExport(data, columns)
      expect(result).toEqual([
        ['Name', 'Missing'],
        ['Alice', ''],
      ])
    })
  })
})

// ── useDataExport hook tests ───────────────────────────────────────────

describe('useDataExport hook', () => {
  let clickSpy: ReturnType<typeof vi.fn>
  let createElementSpy: ReturnType<typeof vi.spyOn>
  let originalCreateObjectURL: typeof URL.createObjectURL
  let originalRevokeObjectURL: typeof URL.revokeObjectURL

  beforeEach(() => {
    clickSpy = vi.fn()
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = vi.fn(() => 'blob:mock')
    URL.revokeObjectURL = vi.fn()
    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
      style: {},
    } as unknown as HTMLAnchorElement)
  })

  afterEach(() => {
    createElementSpy.mockRestore()
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('exports CSV and manages loading state', async () => {
    // Restore createElement so renderHook can mount
    createElementSpy.mockRestore()

    const { renderHook, act } = await import('@testing-library/react')
    const { useDataExport } = await import('../src/hooks/useDataExport')

    const { result } = renderHook(() => useDataExport())
    expect(result.current.isExporting).toBe(false)

    // Re-mock createElement for the actual export call
    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '', download: '', click: clickSpy, style: {},
    } as unknown as HTMLAnchorElement)

    await act(async () => {
      await result.current.exportCSV([{ a: 1 }], 'test.csv')
    })

    expect(result.current.isExporting).toBe(false)
    expect(clickSpy).toHaveBeenCalled()
  })

  it('exports JSON and manages loading state', async () => {
    createElementSpy.mockRestore()

    const { renderHook, act } = await import('@testing-library/react')
    const { useDataExport } = await import('../src/hooks/useDataExport')

    const { result } = renderHook(() => useDataExport())

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '', download: '', click: clickSpy, style: {},
    } as unknown as HTMLAnchorElement)

    await act(async () => {
      await result.current.exportJSON({ data: 'test' }, 'test.json')
    })

    expect(result.current.isExporting).toBe(false)
    expect(clickSpy).toHaveBeenCalled()
  })

  it('handles errors gracefully', async () => {
    createElementSpy.mockRestore()
    URL.createObjectURL = vi.fn(() => {
      throw new Error('Download failed')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { renderHook, act } = await import('@testing-library/react')
    const { useDataExport } = await import('../src/hooks/useDataExport')
    const { result } = renderHook(() => useDataExport())

    await act(async () => {
      await result.current.exportJSON({ fail: true }, 'fail.json')
    })

    expect(result.current.isExporting).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('handles large data with chunked CSV processing', async () => {
    createElementSpy.mockRestore()

    const { renderHook, act } = await import('@testing-library/react')
    const { useDataExport } = await import('../src/hooks/useDataExport')
    const { result } = renderHook(() => useDataExport())

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '', download: '', click: clickSpy, style: {},
    } as unknown as HTMLAnchorElement)

    const largeData = Array.from({ length: 5000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
    }))

    await act(async () => {
      await result.current.exportCSV(largeData, 'large.csv')
    })

    expect(result.current.isExporting).toBe(false)
    expect(clickSpy).toHaveBeenCalled()
  })
})
