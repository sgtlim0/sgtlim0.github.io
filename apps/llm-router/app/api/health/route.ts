/**
 * GET /api/health
 *
 * Returns health status of the LLM Router API proxy.
 * Checks connectivity to the upstream LLM Router backend.
 */

import { NextResponse } from 'next/server'

import { fetchRouter } from '../lib/proxy'

export async function GET() {
  try {
    const upstream = await fetchRouter('/health')

    if (!upstream.ok) {
      return NextResponse.json({ status: 'degraded', router: false, proxy: true }, { status: 200 })
    }

    return NextResponse.json({
      status: 'ok',
      router: true,
      proxy: true,
    })
  } catch {
    return NextResponse.json({ status: 'degraded', router: false, proxy: true }, { status: 200 })
  }
}
