/**
 * POST /api/analyze
 *
 * Proxies analyze requests to AI Core /analyze.
 * Used by Chrome Extension popup for text analysis.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchAiCore } from '../lib/aiCore'
import { validateCsrfHeader } from '../lib/csrf'
import { analyzeRequestSchema } from '../lib/validation'

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfHeader(request)
  if (csrfError) return csrfError

  try {
    const body = await request.json()
    const parsed = analyzeRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const upstream = await fetchAiCore('/analyze', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { error: 'AI Core analyze request failed', detail: errorBody },
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
