// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Admin Verify — POST /api/admin/verify    ║
// ║  [MODULE: Admin] 伺服器端密碼驗證，密碼不暴露於前端   ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { adminCookie } from '@/lib/security/session'

export async function POST(req: NextRequest) {
  // Rate-limit: 5 attempts per IP per 15 minutes
  const ip = getClientIp(req.headers)
  const { allowed } = await checkRateLimit(`admin:${ip}`, 5, 900)
  if (!allowed) {
    return NextResponse.json({ error: '嘗試次數過多，請稍後再試' }, { status: 429 })
  }

  const { password } = await req.json()
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json({ error: '後台尚未設定管理密碼' }, { status: 503 })
  }

  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  return NextResponse.json({ ok: true }, {
    headers: {
      'Set-Cookie': adminCookie(),
    },
  })
}
