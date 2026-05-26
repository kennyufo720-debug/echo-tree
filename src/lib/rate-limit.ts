// ╔══════════════════════════════════════════════════════╗
// ║  SERVER UTIL: IP-based rate limiter                  ║
// ║  [MODULE: Security] Redis-backed, no-op if no Redis  ║
// ╚══════════════════════════════════════════════════════╝

import { cacheGet, cacheSet } from './cache'

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number   // seconds until window resets
}

/**
 * Sliding-window counter rate limiter.
 * Returns { allowed: false } when limit is exceeded.
 * Silently allows everything when Redis is unavailable.
 */
export async function checkRateLimit(
  identifier: string,   // e.g. `upload:${ip}` or `otp:${phone}`
  limit: number,        // max requests
  windowSecs: number,   // window length in seconds
): Promise<RateLimitResult> {
  try {
    const key = `rl:${identifier}`
    const current = (await cacheGet<number>(key)) ?? 0
    if (current >= limit) {
      return { allowed: false, remaining: 0, resetIn: windowSecs }
    }
    // Increment; keep the original TTL if key already exists
    await cacheSet(key, current + 1, windowSecs)
    return { allowed: true, remaining: limit - current - 1, resetIn: windowSecs }
  } catch {
    // Redis unavailable → fail open (never block legitimate traffic)
    return { allowed: true, remaining: limit, resetIn: windowSecs }
  }
}

/** Convenience: extract best-effort client IP from Next.js request headers */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
