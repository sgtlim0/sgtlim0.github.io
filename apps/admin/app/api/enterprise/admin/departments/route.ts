/**
 * GET /api/enterprise/admin/departments
 *
 * Proxies department list requests to the Enterprise API.
 * Validates pagination query parameters with Zod.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchEnterprise, getClientIp } from '../../../lib/proxy'
import {
  checkRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
} from '../../../lib/rateLimit'
import { departmentQuerySchema } from '../../../lib/validation'

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, 'read')

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult)
    }

    const { searchParams } = request.nextUrl
    const queryParams = Object.fromEntries(searchParams.entries())
    const parsed = departmentQuerySchema.safeParse(queryParams)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '잘못된 쿼리 파라미터입니다.', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { page, limit } = parsed.data
    const upstream = await fetchEnterprise(`/admin/departments?page=${page}&limit=${limit}`)

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { success: false, error: '부서 목록 조회에 실패했습니다.', detail: errorBody },
        { status: upstream.status },
      )
    }

    const data = await upstream.json()
    return addRateLimitHeaders(NextResponse.json(data), rateLimitResult)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Enterprise API 서비스에 연결할 수 없습니다.' },
      { status: 503 },
    )
  }
}
