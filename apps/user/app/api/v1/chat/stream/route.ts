/**
 * POST /api/v1/chat/stream
 *
 * Proxies SSE streaming from AI Core /chat/stream.
 * Uses ReadableStream to pass through events without buffering.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchAiCore, getClientIp } from '../../../lib/aiCore'
import { validateCsrfHeader } from '../../../lib/csrf'
import { checkRateLimit, createRateLimitResponse } from '../../../lib/rateLimit'
import { chatRequestSchema } from '../../../lib/validation'
import { withVersionHeaders, API_VERSION } from '../../version'

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfHeader(request)
  if (csrfError) return withVersionHeaders(csrfError)

  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, 'stream')

    if (!rateLimitResult.allowed) {
      return withVersionHeaders(createRateLimitResponse(rateLimitResult))
    }

    const body = await request.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return withVersionHeaders(
        NextResponse.json(
          { error: 'Invalid request body', details: parsed.error.flatten() },
          { status: 400 },
        ),
      )
    }

    const upstream = await fetchAiCore('/chat/stream', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return withVersionHeaders(
        NextResponse.json(
          { error: 'AI Core stream request failed', detail: errorBody },
          { status: upstream.status },
        ),
      )
    }

    if (!upstream.body) {
      return withVersionHeaders(
        NextResponse.json({ error: 'No stream body from AI Core' }, { status: 502 }),
      )
    }

    const stream = createPassthroughStream(upstream.body)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-API-Version': API_VERSION,
      },
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return withVersionHeaders(
        NextResponse.json({ error: 'Malformed JSON in request body' }, { status: 400 }),
      )
    }

    return withVersionHeaders(
      NextResponse.json({ error: 'AI Core service unavailable' }, { status: 503 }),
    )
  }
}

function createPassthroughStream(
  upstreamBody: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const reader = upstreamBody.getReader()

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read()

        if (done) {
          controller.close()
          return
        }

        controller.enqueue(value)
      } catch {
        controller.close()
      }
    },
    cancel() {
      reader.cancel()
    },
  })
}
