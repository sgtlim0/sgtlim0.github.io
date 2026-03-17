/**
 * GET /api/health
 *
 * Returns health status of the Admin API proxy.
 * Checks connectivity to the upstream Enterprise API.
 */

import { NextResponse } from 'next/server'

import { fetchEnterprise } from '../lib/proxy'

export async function GET() {
  try {
    const upstream = await fetchEnterprise('/health')

    if (!upstream.ok) {
      return NextResponse.json(
        { status: 'degraded', enterprise: false, proxy: true },
        { status: 200 },
      )
    }

    return NextResponse.json({
      status: 'ok',
      enterprise: true,
      proxy: true,
    })
  } catch {
    return NextResponse.json(
      { status: 'degraded', enterprise: false, proxy: true },
      { status: 200 },
    )
  }
}
