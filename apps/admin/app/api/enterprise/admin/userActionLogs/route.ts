/**
 * GET /api/enterprise/admin/userActionLogs
 *
 * Proxies audit log queries to the Enterprise API.
 * Validates all query parameters (date range, user, event type, pagination)
 * with Zod schema before forwarding.
 *
 * When isXlsx=true, returns the upstream binary blob as-is (Excel download).
 */

import { NextRequest, NextResponse } from 'next/server'

import { fetchEnterprise, getClientIp } from '../../../lib/proxy'
import {
  checkRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
} from '../../../lib/rateLimit'
import { auditLogDownloadQuerySchema } from '../../../lib/validation'

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, 'read')

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult)
    }

    const { searchParams } = request.nextUrl
    const queryParams = Object.fromEntries(searchParams.entries())
    const parsed = auditLogDownloadQuerySchema.safeParse(queryParams)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '잘못된 쿼리 파라미터입니다.', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Build validated query string
    const validatedParams = new URLSearchParams()
    const data = parsed.data

    if (data.from) validatedParams.set('from', data.from)
    if (data.to) validatedParams.set('to', data.to)
    if (data.workspaceId !== undefined) validatedParams.set('workspaceId', String(data.workspaceId))
    if (data.name) validatedParams.set('name', data.name)
    if (data.email) validatedParams.set('email', data.email)
    if (data.eventDetail) validatedParams.set('eventDetail', data.eventDetail)
    validatedParams.set('sort', data.sort)
    validatedParams.set('page', String(data.page))
    validatedParams.set('limit', String(data.limit))
    if (data.isXlsx) validatedParams.set('isXlsx', 'true')

    const upstream = await fetchEnterprise(`/admin/userActionLogs?${validatedParams.toString()}`)

    if (!upstream.ok) {
      const errorBody = await upstream.text()
      return NextResponse.json(
        { success: false, error: '감사 로그 조회에 실패했습니다.', detail: errorBody },
        { status: upstream.status },
      )
    }

    // If Excel download requested, pass through the binary response
    if (data.isXlsx) {
      const blob = await upstream.arrayBuffer()
      return new NextResponse(blob, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="audit_logs.xlsx"',
        },
      })
    }

    const jsonData = await upstream.json()
    return addRateLimitHeaders(NextResponse.json(jsonData), rateLimitResult)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Enterprise API 서비스에 연결할 수 없습니다.' },
      { status: 503 },
    )
  }
}
