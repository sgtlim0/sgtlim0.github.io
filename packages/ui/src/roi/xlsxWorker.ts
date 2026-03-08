/**
 * Web Worker for Excel (xlsx) file parsing.
 *
 * Message protocol:
 *   Request  → WorkerRequest  (parse | validate)
 *   Response → WorkerResponse (parsed | validated | error | progress)
 */

// ── Constants ────────────────────────────────────────────────────────
const PARSE_TIMEOUT_MS = 30_000
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
const PROGRESS_CHUNK_ROWS = 2_000

// ── Message types (shared with consumers) ────────────────────────────
export type WorkerRequest =
  | { type: 'parse'; buffer: ArrayBuffer; fileName: string }
  | { type: 'validate'; data: unknown[] }

export type WorkerResponse =
  | { type: 'parsed'; data: Record<string, unknown>[]; columns: string[] }
  | { type: 'validated'; valid: boolean; errors: string[] }
  | { type: 'error'; message: string }
  | { type: 'progress'; percent: number }

type CellValue = string | number | boolean | null

// ── Worker entry ─────────────────────────────────────────────────────
self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data

  switch (msg.type) {
    case 'parse':
      await handleParse(msg.buffer, msg.fileName)
      break
    case 'validate':
      handleValidate(msg.data)
      break
    default:
      // Unknown message type — silently ignore for forward-compat
      break
  }
}

// ── Parse handler ────────────────────────────────────────────────────
async function handleParse(buffer: ArrayBuffer, _fileName: string): Promise<void> {
  // Size guard
  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    postError(`파일 크기가 ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB를 초과합니다.`)
    return
  }

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('파싱 시간이 초과되었습니다.')), PARSE_TIMEOUT_MS),
    )

    const parse = async () => {
      postProgress(0)

      const { read, utils } = await import('xlsx')
      postProgress(10)

      const wb = read(buffer, { type: 'array' })
      postProgress(30)

      const sheetName = wb.SheetNames[0]
      if (!sheetName) return { data: [] as Record<string, CellValue>[], columns: [] as string[] }

      const sheet = wb.Sheets[sheetName]
      if (!sheet) return { data: [] as Record<string, CellValue>[], columns: [] as string[] }

      const allData = utils.sheet_to_json<Record<string, CellValue>>(sheet)
      const columns = allData.length > 0 ? Object.keys(allData[0]) : []

      // Emit progress in chunks for large files
      const total = allData.length
      if (total > PROGRESS_CHUNK_ROWS) {
        for (let i = PROGRESS_CHUNK_ROWS; i < total; i += PROGRESS_CHUNK_ROWS) {
          const pct = 30 + Math.round((i / total) * 60)
          postProgress(Math.min(pct, 90))
        }
      }

      postProgress(95)
      return { data: allData, columns }
    }

    const result = await Promise.race([parse(), timeout])

    postProgress(100)

    const resp: WorkerResponse = {
      type: 'parsed',
      data: result.data,
      columns: result.columns,
    }
    self.postMessage(resp)
  } catch (error) {
    postError(error instanceof Error ? error.message : '파일 파싱에 실패했습니다.')
  }
}

// ── Validate handler ─────────────────────────────────────────────────
function handleValidate(data: unknown[]): void {
  const errors: string[] = []

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('데이터가 비어있습니다.')
    const resp: WorkerResponse = { type: 'validated', valid: false, errors }
    self.postMessage(resp)
    return
  }

  const requiredColumns = ['날짜', '사용자ID', '부서', '직급', '기능', '모델', '토큰수', '절감시간_분', '만족도']
  const firstRow = data[0] as Record<string, unknown>
  const keys = Object.keys(firstRow)

  for (const col of requiredColumns) {
    if (!keys.includes(col)) {
      errors.push(`필수 컬럼 '${col}'이(가) 누락되었습니다.`)
    }
  }

  const resp: WorkerResponse = {
    type: 'validated',
    valid: errors.length === 0,
    errors,
  }
  self.postMessage(resp)
}

// ── Helpers ──────────────────────────────────────────────────────────
function postError(message: string): void {
  const resp: WorkerResponse = { type: 'error', message }
  self.postMessage(resp)
}

function postProgress(percent: number): void {
  const resp: WorkerResponse = { type: 'progress', percent }
  self.postMessage(resp)
}
