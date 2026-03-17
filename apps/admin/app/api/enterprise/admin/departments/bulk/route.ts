/**
 * POST /api/enterprise/admin/departments/bulk
 *
 * Proxies bulk department create/update/delete to the Enterprise API.
 * Validates request body with departmentBulkRequestSchema from @hchat/ui.
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchEnterprise, getClientIp } from '../../../../lib/proxy'
import {
  checkRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
} from '../../../../lib/rateLimit'
import { departmentBulkRequestSchema, bulkQuerySchema } from '../../../../lib/validation'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, 'bulk')

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult)
    }

    // Validate query parameters
    const { searchParams } = request.nextUrl
    const queryParams = Object.fromEntries(searchParams.entries())
    const parsedQuery = bulkQuerySchema.safeParse(queryParams)

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 쿼리 파라미터입니다.',
          details: parsedQuery.error.flatten(),
        },
        { status: 400 },
      )
    }

    // Validate request body
    const body = await request.json()
    const parsed = departmentBulkRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청 본문입니다.', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { implicitDeletion } = parsedQuery.data
    const upstream = await fetchEnterprise(
      `/admin/departments/bulk?implicitDeletion=${implicitDeletion}`,
      {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      },
    )

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { success: false, error: '부서 벌크 작업에 실패했습니다.', detail: errorBody },
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
      { success: false, error: 'Enterprise API 서비스에 연결할 수 없습니다.' },
      { status: 503 },
    )
  }
}
