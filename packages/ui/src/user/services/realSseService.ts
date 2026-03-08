/**
 * Real SSE service that connects to the AI Core backend via /api/chat/stream.
 *
 * Uses fetch + ReadableStream for POST support with proper SSE parsing,
 * buffered line handling, and AbortController-based cancellation.
 */

import type { SSEStream } from './sseService'
import { getApiUrl } from '../../client/serviceFactory'

const SSE_SKIP = Symbol('sse-skip')
type SSEParseResult = string | null | typeof SSE_SKIP

function parseSSELine(line: string): SSEParseResult {
  if (!line.startsWith('data: ')) {
    return SSE_SKIP
  }

  const data = line.slice(6)
  if (data === '[DONE]') {
    return null
  }

  if (data.startsWith('[ERROR]')) {
    throw new Error(data)
  }

  try {
    const parsed = JSON.parse(data) as { text?: string }
    return parsed.text ?? data
  } catch {
    return data
  }
}

/**
 * Create a real SSE stream connected to the AI Core backend.
 *
 * @param content - The user message to send
 * @param assistantId - The assistant identifier
 * @param history - Optional conversation history for context
 */
export function realStreamResponse(
  content: string,
  assistantId: string,
  history?: Array<{ role: string; content: string }>,
): SSEStream {
  const abortController = new AbortController()

  const abort = () => {
    abortController.abort()
  }

  const subscribe = (
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
  ) => {
    const baseUrl = getApiUrl()
    const url = `${baseUrl}/api/chat/stream`

    globalThis
      .fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          message: content,
          history: history ?? [],
        }),
        signal: abortController.signal,
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('ReadableStream not available')
        }

        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              onDone()
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (trimmed === '') {
                continue
              }

              try {
                const parsed = parseSSELine(trimmed)
                if (parsed === null) {
                  onDone()
                  reader.cancel()
                  return
                }
                if (parsed !== SSE_SKIP) {
                  onChunk(parsed)
                }
              } catch (parseError) {
                onError(
                  parseError instanceof Error
                    ? parseError
                    : new Error(String(parseError)),
                )
                reader.cancel()
                return
              }
            }
          }
        } catch (readError) {
          if (abortController.signal.aborted) {
            return
          }
          throw readError
        }
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return
        }
        onError(
          error instanceof Error
            ? error
            : new Error('Unknown error during SSE streaming'),
        )
      })
  }

  return {
    subscribe,
    abort,
  }
}
