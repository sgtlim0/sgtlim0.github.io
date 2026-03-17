/**
 * GET /api/v1/models
 *
 * Proxies model list requests to the LLM Router backend.
 * Validates query parameters (provider, category, search, page, pageSize) with Zod.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchRouter, getClientIp } from '../../lib/proxy'
import { checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '../../lib/rateLimit'
import { modelQuerySchema } from '../../lib/validation'

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, 'read')

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult)
    }

    const { searchParams } = request.nextUrl
    const queryParams = Object.fromEntries(searchParams.entries())
    const parsed = modelQuerySchema.safeParse(queryParams)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '잘못된 쿼리 파라미터입니다.', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const params = new URLSearchParams()
    const { page, pageSize, provider, category, search } = parsed.data
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (provider) params.set('provider', provider)
    if (category) params.set('category', category)
    if (search) params.set('search', search)

    const upstream = await fetchRouter(`/models?${params.toString()}`)

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { success: false, error: '모델 목록 조회에 실패했습니다.', detail: errorBody },
        { status: upstream.status },
      )
    }

    const data = await upstream.json()
    return addRateLimitHeaders(NextResponse.json(data), rateLimitResult)
  } catch {
    return NextResponse.json(
      { success: false, error: 'LLM Router 서비스에 연결할 수 없습니다.' },
      { status: 503 },
    )
  }
}
