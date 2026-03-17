/**
 * POST /api/v1/chat/stream
 *
 * Proxies SSE streaming chat requests to the LLM Router backend.
 * Validates request body with streamingOptionsSchema from @hchat/ui.
 * Uses ReadableStream to pass through events without buffering.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchRouter, getClientIp } from '../../../lib/proxy'
import { checkRateLimit, createRateLimitResponse } from '../../../lib/rateLimit'
import { streamingOptionsSchema } from '../../../lib/validation'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, 'stream')

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const parsed = streamingOptionsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청 본문입니다.', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const upstream = await fetchRouter('/chat/stream', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { success: false, error: '스트리밍 요청에 실패했습니다.', detail: errorBody },
        { status: upstream.status },
      )
    }

    if (!upstream.body) {
      return NextResponse.json(
        { success: false, error: '스트리밍 응답 본문이 없습니다.' },
        { status: 502 },
      )
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
      return NextResponse.json(
        { success: false, error: '잘못된 JSON 형식입니다.' },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { success: false, error: 'LLM Router 서비스에 연결할 수 없습니다.' },
      { status: 503 },
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
