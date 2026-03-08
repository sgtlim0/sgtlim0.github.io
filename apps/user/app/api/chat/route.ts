/**
 * POST /api/chat
 *
 * Proxies to AI Core /chat with Zod-validated request bodies.
 * Returns 400 for invalid input, 503 when AI Core is unreachable.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchAiCore } from '../lib/aiCore'
import { chatRequestSchema } from '../lib/validation'

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

    const upstream = await fetchAiCore('/chat', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { error: 'AI Core request failed', detail: errorBody },
        { status: upstream.status },
      )
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Malformed JSON in request body' }, { status: 400 })
    }

    return NextResponse.json({ error: 'AI Core service unavailable' }, { status: 503 })
  }
}
