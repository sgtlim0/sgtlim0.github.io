/**
 * POST /api/v1/analyze
 *
 * Proxies analyze requests to AI Core /analyze.
 * Used by Chrome Extension popup for text analysis.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchAiCore, getClientIp } from '../../lib/aiCore'
import { validateCsrfHeader } from '../../lib/csrf'
import { checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '../../lib/rateLimit'
import { analyzeRequestSchema } from '../../lib/validation'
import { withVersionHeaders } from '../version'

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfHeader(request)
  if (csrfError) return withVersionHeaders(csrfError)

  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, 'analyze')

    if (!rateLimitResult.allowed) {
      return withVersionHeaders(createRateLimitResponse(rateLimitResult))
    }

    const body = await request.json()
    const parsed = analyzeRequestSchema.safeParse(body)

    if (!parsed.success) {
      return withVersionHeaders(
        NextResponse.json(
          { error: 'Invalid request body', details: parsed.error.flatten() },
          { status: 400 },
        ),
      )
    }

    const upstream = await fetchAiCore('/analyze', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return withVersionHeaders(
        NextResponse.json(
          { error: 'AI Core analyze request failed', detail: errorBody },
          { status: upstream.status },
        ),
      )
    }

    const data = await upstream.json()
    return withVersionHeaders(addRateLimitHeaders(NextResponse.json(data), rateLimitResult))
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
