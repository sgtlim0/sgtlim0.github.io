/**
 * GET /api/health
 *
 * Proxies to AI Core /health and returns a degraded status
 * if the upstream service is unreachable.
 */

import { NextResponse } from 'next/server'

import { fetchAiCore } from '../lib/aiCore'

export async function GET() {
  try {
    const upstream = await fetchAiCore('/health')

    if (!upstream.ok) {
      return NextResponse.json({ status: 'degraded', aiCore: false, proxy: true }, { status: 200 })
    }

    const data = await upstream.json()

    return NextResponse.json({
      status: 'ok',
      aiCore: true,
      proxy: true,
      upstream: data,
    })
  } catch {
    return NextResponse.json({ status: 'degraded', aiCore: false, proxy: true }, { status: 200 })
  }
}
