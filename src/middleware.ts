// ╔══════════════════════════════════════════════════════╗
// ║  Middleware — Security headers for all responses     ║
// ║  [MODULE: Infra] 套用安全 HTTP headers               ║
// ╚══════════════════════════════════════════════════════╝

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const h = res.headers

  // Prevent clickjacking
  h.set('X-Frame-Options', 'DENY')
  // Prevent MIME-type sniffing
  h.set('X-Content-Type-Options', 'nosniff')
  // Control referrer info sent to third parties
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Disable unused browser features
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return res
}

export const config = {
  // Apply to every route except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
