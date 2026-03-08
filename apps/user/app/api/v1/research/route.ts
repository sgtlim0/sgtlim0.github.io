/**
 * POST /api/v1/research
 *
 * Proxies to AI Core /research with Zod validation and rate limiting.
 * Returns 400 for invalid input, 429 for rate limit, 503 when AI Core is down.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchAiCore, getClientIp } from '../../lib/aiCore'
import { validateCsrfHeader } from '../../lib/csrf'
import { checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '../../lib/rateLimit'
import { researchRequestSchema } from '../../lib/validation'
import { withVersionHeaders } from '../version'

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfHeader(request)
  if (csrfError) return withVersionHeaders(csrfError)

  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, 'research')

    if (!rateLimitResult.allowed) {
      return withVersionHeaders(createRateLimitResponse(rateLimitResult))
    }

    const body = await request.json()
    const parsed = researchRequestSchema.safeParse(body)

    if (!parsed.success) {
      return withVersionHeaders(
        NextResponse.json(
          { error: 'Invalid request body', details: parsed.error.flatten() },
          { status: 400 },
        ),
      )
    }

    const upstream = await fetchAiCore('/research', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return withVersionHeaders(
        NextResponse.json(
          { error: 'AI Core research request failed', detail: errorBody },
          { status: upstream.status },
        ),
      )
    }

    const data = await upstream.json()
    const response = NextResponse.json(data)

    return withVersionHeaders(addRateLimitHeaders(response, rateLimitResult))
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
