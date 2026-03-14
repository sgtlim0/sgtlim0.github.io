import type { ExtensionAnalyzeService } from './types'
import type { AnalyzeRequest, StreamChunk } from '../types'
import { getSettings } from '../utils/storage'

async function parseSSEStream(
  response: Response,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal,
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel()
        throw new Error('Aborted')
      }

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue

        const data = line.slice(6).trim()
        if (data === '[DONE]') {
          onChunk({ type: 'done', content: '' })
          return
        }

        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            onChunk({ type: 'chunk', content: parsed.content })
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function createRealAnalyzeService(): ExtensionAnalyzeService {
  return {
    async analyze(
      request: AnalyzeRequest,
      onChunk: (chunk: StreamChunk) => void,
      signal?: AbortSignal,
    ): Promise<void> {
      const settings = await getSettings()
      const response = await fetch(`${settings.apiBaseUrl}/api/v1/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          mode: request.mode,
          url: request.url,
          title: request.title,
        }),
        signal,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(errorText || `Analyze request failed (${response.status})`)
      }

      await parseSSEStream(response, onChunk, signal)
    },
  }
}
