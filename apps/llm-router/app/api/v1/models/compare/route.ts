/**
 * POST /api/v1/models/compare
 *
 * Proxies model comparison requests to the LLM Router backend.
 * Validates request body with modelComparisonRequestSchema from @hchat/ui.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchRouter, getClientIp } from '../../../lib/proxy'
import {
  checkRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
} from '../../../lib/rateLimit'
import { modelComparisonRequestSchema } from '../../../lib/validation'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, 'compare')

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const parsed = modelComparisonRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청 본문입니다.', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const upstream = await fetchRouter('/models/compare', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { success: false, error: '모델 비교에 실패했습니다.', detail: errorBody },
        { status: upstream.status },
      )
    }

    const data = await upstream.json()
    return addRateLimitHeaders(NextResponse.json(data), rateLimitResult)
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
