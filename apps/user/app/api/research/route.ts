/**
 * POST /api/research
 *
 * Proxies to AI Core /research with Zod validation and rate limiting.
 * Returns 400 for invalid input, 429 for rate limit, 503 when AI Core is down.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchAiCore, getClientIp } from '../lib/aiCore'
import { validateCsrfHeader } from '../lib/csrf'
import { checkRateLimit } from '../lib/rateLimit'
import { researchRequestSchema } from '../lib/validation'

const RATE_LIMIT_PER_MINUTE = 10

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfHeader(request)
  if (csrfError) return csrfError

  try {
    const ip = getClientIp(request)
    const { allowed, remaining } = checkRateLimit(ip, RATE_LIMIT_PER_MINUTE)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
          },
        },
      )
    }

    const body = await request.json()
    const parsed = researchRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const upstream = await fetchAiCore('/research', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { error: 'AI Core research request failed', detail: errorBody },
        { status: upstream.status },
      )
    }

    const data = await upstream.json()

    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Remaining': String(remaining),
      },
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Malformed JSON in request body' }, { status: 400 })
    }

    return NextResponse.json({ error: 'AI Core service unavailable' }, { status: 503 })
  }
}
