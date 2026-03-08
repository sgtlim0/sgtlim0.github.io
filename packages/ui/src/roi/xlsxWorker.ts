const PARSE_TIMEOUT_MS = 30_000
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

interface ParseRequest {
  type: 'parse'
  buffer: ArrayBuffer
}

interface ParseResponse {
  type: 'result'
  data: Record<string, string | number | boolean | null>[]
}

interface ErrorResponse {
  type: 'error'
  message: string
}

self.onmessage = async (e: MessageEvent<ParseRequest>) => {
  if (e.data.type !== 'parse') return

  const { buffer } = e.data

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    const resp: ErrorResponse = {
      type: 'error',
      message: `파일 크기가 ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB를 초과합니다.`,
    }
    self.postMessage(resp)
    return
  }

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('파싱 시간이 초과되었습니다.')), PARSE_TIMEOUT_MS),
    )

    const parse = async () => {
      const { read, utils } = await import('xlsx')
      const wb = read(buffer, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      if (!sheetName) return []
      const sheet = wb.Sheets[sheetName]
      if (!sheet) return []
      return utils.sheet_to_json<Record<string, string | number | boolean | null>>(sheet)
    }

    const data = await Promise.race([parse(), timeout])
    const resp: ParseResponse = { type: 'result', data }
    self.postMessage(resp)
  } catch (error) {
    const resp: ErrorResponse = {
      type: 'error',
      message: error instanceof Error ? error.message : '파일 파싱에 실패했습니다.',
    }
    self.postMessage(resp)
  }
}
