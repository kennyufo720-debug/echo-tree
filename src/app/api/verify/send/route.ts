// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Verify Send — POST /api/verify/send      ║
// ║  [MODULE: Auth] 產生 OTP，儲存於 Redis（5 分鐘有效）  ║
// ╚══════════════════════════════════════════════════════╝
//
// Production: set OTP_PROVIDER=twilio and configure TWILIO_* env vars.
// Development: OTP is logged to console and readable from Redis.

import { NextRequest, NextResponse } from 'next/server'
import { cacheSet } from '@/lib/cache'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json()

  if (!phone || !/^09\d{8}$/.test(phone)) {
    return NextResponse.json({ error: '無效的手機號碼' }, { status: 400 })
  }

  // Rate-limit: 3 sends per phone per 10 minutes
  const ip = getClientIp(req.headers)
  const [byPhone, byIp] = await Promise.all([
    checkRateLimit(`otp-send:${phone}`, 3, 600),
    checkRateLimit(`otp-send-ip:${ip}`, 10, 600),
  ])
  if (!byPhone.allowed || !byIp.allowed) {
    return NextResponse.json({ error: '發送次數過多，請稍後再試' }, { status: 429 })
  }

  // Production must use a one-time random OTP. OTP_SECRET is only a local/staging helper.
  const code = process.env.NODE_ENV === 'production'
    ? generateCode()
    : (process.env.OTP_SECRET ?? generateCode())
  await cacheSet(`otp:${phone}`, code, 300)  // 5-minute TTL

  // ── TODO: Real SMS provider ───────────────────────────────────
  // Uncomment and configure when ready:
  // if (process.env.OTP_PROVIDER === 'twilio') {
  //   await twilioClient.messages.create({
  //     body: `【Echo Tree】您的驗證碼為 ${code}，5 分鐘內有效。`,
  //     from: process.env.TWILIO_PHONE,
  //     to: `+886${phone.slice(1)}`,
  //   })
  // }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OTP DEV] ${phone} → ${code}`)
  }

  return NextResponse.json({ ok: true })
}
