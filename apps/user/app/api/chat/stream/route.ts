/**
 * POST /api/chat/stream
 *
 * Proxies SSE streaming from AI Core /chat/stream.
 * Uses ReadableStream to pass through events without buffering.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchAiCore } from '../../lib/aiCore'
import { chatRequestSchema } from '../../lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const upstream = await fetchAiCore('/chat/stream', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { error: 'AI Core stream request failed', detail: errorBody },
        { status: upstream.status },
      )
    }

    if (!upstream.body) {
      return NextResponse.json({ error: 'No stream body from AI Core' }, { status: 502 })
    }

    const stream = createPassthroughStream(upstream.body)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Malformed JSON in request body' }, { status: 400 })
    }

    return NextResponse.json({ error: 'AI Core service unavailable' }, { status: 503 })
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
