// ╔══════════════════════════════════════════════════════╗
// ║  Middleware — Global rate limiter + Security headers ║
// ║  [MODULE: Infra] 全域限流 + 安全 HTTP headers         ║
// ╚══════════════════════════════════════════════════════╝
//
// Rate limit:  60 requests / minute / IP  on all /api/* routes
//              (exempts /api/health — used by Docker HEALTHCHECK)
//
// Implementation: in-process sliding-window Map — works on Edge
// Runtime with zero external dependencies.
// ┌─ Upgrade path for multi-instance deployments ────────┐
// │  Replace the rateLimit() function body with an       │
// │  Upstash Redis INCR+EXPIRE call (HTTP, Edge-safe).   │
// └──────────────────────────────────────────────────────┘

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ── Rate-limit constants ───────────────────────────────
const WINDOW_MS   = 60_000  // 1 minute
const MAX_REQUESTS = 60     // per IP per window

// ── In-process sliding-window store ───────────────────
// ⚠️  VERCEL / SERVERLESS NOTE:
// Each edge worker is an isolated V8 sandbox.  A single-region warm worker
// accumulates counts correctly across sequential requests, but a burst of
// concurrent traffic is spread across MANY workers — each with its own Map —
// so the global cap is not enforced under load.
//
// ✅  Works as-is: Docker (single process), single-region dev server.
// 🔧  For Vercel / multi-instance: replace rateLimit() with an
//     Upstash Redis call (HTTP, Edge-safe):
//       await redis.incr(key); await redis.expire(key, 60)
//     Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to env.
interface Window { count: number; resetAt: number }
const store = new Map<string, Window>()
let sweepCounter = 0

/** Prune expired entries every 500 requests to prevent unbounded growth. */
function maybeSweep(): void {
  if (++sweepCounter % 500 !== 0) return
  const now = Date.now()
  for (const [key, w] of store) {
    if (now >= w.resetAt) store.delete(key)
  }
}

interface RateLimitResult {
  allowed:   boolean
  remaining: number
  resetAt:   number   // epoch ms
}

function rateLimit(ip: string): RateLimitResult {
  maybeSweep()
  const now = Date.now()
  let w = store.get(ip)
  if (!w || now >= w.resetAt) {
    w = { count: 0, resetAt: now + WINDOW_MS }
    store.set(ip, w)
  }
  w.count++
  return {
    allowed:   w.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - w.count),
    resetAt:   w.resetAt,
  }
}

/** Best-effort IP from standard proxy headers. */
function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ── Middleware ─────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Global rate limit for all API routes ─────────────
  if (pathname.startsWith('/api/') && pathname !== '/api/health') {
    const ip = getIp(request)
    const { allowed, remaining, resetAt } = rateLimit(ip)

    const resetSec   = Math.ceil(resetAt / 1000)           // Unix epoch seconds
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)

    if (!allowed) {
      return NextResponse.json(
        {
          error:   '請求過於頻繁，請稍後再試',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After':          String(retryAfter),
            'X-RateLimit-Limit':    String(MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset':    String(resetSec),
          },
        },
      )
    }

    // Pass rate-limit info through on successful requests too
    const res = NextResponse.next()
    applySecurityHeaders(res)
    res.headers.set('X-RateLimit-Limit',     String(MAX_REQUESTS))
    res.headers.set('X-RateLimit-Remaining', String(remaining))
    res.headers.set('X-RateLimit-Reset',     String(resetSec))
    return res
  }

  // ── All other routes — security headers only ─────────
  const res = NextResponse.next()
  applySecurityHeaders(res)
  return res
}

function applySecurityHeaders(res: NextResponse): void {
  const h = res.headers
  h.set('X-Frame-Options',    'DENY')
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('Referrer-Policy',    'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

export const config = {
  // Apply to every route except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
