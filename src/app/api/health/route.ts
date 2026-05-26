// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Health — GET /api/health                 ║
// ║  [MODULE: Infra] Docker / load balancer health check ║
// ╚══════════════════════════════════════════════════════╝

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ status: 'ok', ts: Date.now() })
}
