// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Verify Check — POST /api/verify/check    ║
// ║  [MODULE: Auth] 伺服器端 OTP 驗證，避免前端繞過       ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { cacheGet, cacheDel } from '@/lib/cache'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json()

  if (!phone || !code) {
    return NextResponse.json({ ok: false, error: '缺少參數' }, { status: 400 })
  }

  // Rate-limit: 5 verify attempts per phone per 10 minutes
  const ip = getClientIp(req.headers)
  const { allowed } = await checkRateLimit(`otp-check:${phone}:${ip}`, 5, 600)
  if (!allowed) {
    return NextResponse.json({ ok: false, error: '驗證次數過多，請重新發送驗證碼' }, { status: 429 })
  }

  // Fetch stored OTP from Redis; fall back to OTP_SECRET for dev without Redis
  const stored = await cacheGet<string>(`otp:${phone}`)
  const fallback = process.env.OTP_SECRET ?? (process.env.NODE_ENV !== 'production' ? '123456' : null)
  const expected = stored ?? fallback

  if (!expected || code !== expected) {
    return NextResponse.json({ ok: false, error: '驗證碼錯誤或已過期' }, { status: 401 })
  }

  // Invalidate the code so it can't be reused
  await cacheDel(`otp:${phone}`)

  return NextResponse.json({ ok: true })
}
