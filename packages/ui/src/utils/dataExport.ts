/**
 * Data Export Utilities — CSV & JSON export (pure implementation, no external libs)
 *
 * Features:
 * - UTF-8 BOM for Excel compatibility (Korean/special chars)
 * - Proper CSV escaping (commas, quotes, newlines)
 * - SSR-safe (no-op when document unavailable)
 * - Memory-safe (URL.revokeObjectURL)
 */

export interface ColumnConfig {
  key: string
  header: string
  formatter?: (value: unknown) => string
}

// ── Blob download helper ───────────────────────────────────────────────

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === 'undefined') return

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

// ── CSV value formatting ───────────────────────────────────────────────

function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

// ── CSV string builder (pure, testable) ────────────────────────────────

export function buildCsvString(
  data: Record<string, unknown>[],
  columns?: string[],
): string {
  if (data.length === 0) return ''

  const keys = columns ?? Object.keys(data[0])
  const BOM = '\uFEFF'

  const headerRow = keys.map(escapeCsvField).join(',')
  const rows = data.map((row) =>
    keys.map((key) => escapeCsvField(formatCsvValue(row[key]))).join(','),
  )

  return BOM + [headerRow, ...rows].join('\r\n') + '\r\n'
}

// ── CSV Export ─────────────────────────────────────────────────────────

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: string[],
): void {
  const csv = buildCsvString(data, columns)
  if (!csv) return

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

// ── JSON Export ────────────────────────────────────────────────────────

export function exportToJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  downloadBlob(blob, filename)
}

// ── Data formatting with column config ─────────────────────────────────

export function formatDataForExport(
  data: Record<string, unknown>[],
  columns: ColumnConfig[],
): string[][] {
  const headers = columns.map((col) => col.header)
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key]
      if (col.formatter) return col.formatter(value)
      if (value === null || value === undefined) return ''
      return String(value)
    }),
  )
  return [headers, ...rows]
}
