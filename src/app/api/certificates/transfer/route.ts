// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Transfer — POST /api/certificates/transfer║
// ║  [MODULE: ESG] 移轉樹憑證至另一持有人                 ║
// ╚══════════════════════════════════════════════════════╝
//
// POST  body: { cert_id, from_phone, to_phone }
//
// 移轉邏輯：
//   1. 驗證 cert 存在、屬於 from_phone、status = 'active'
//   2. 將原始憑證標記為 'transferred'
//   3. 為 to_phone 建立新 'active' 憑證（繼承所有欄位，source_cert_id 指向原始）
//   4. 清除雙方的憑證快取

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { cacheDel } from '@/lib/cache'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limit: 10 transfers per IP per hour
  const ip = getClientIp(req.headers)
  const { allowed } = await checkRateLimit(`cert-transfer:${ip}`, 10, 3600)
  if (!allowed) {
    return NextResponse.json({ error: '移轉次數過多，請稍後再試' }, { status: 429 })
  }

  let body: { cert_id?: string; from_phone?: string; to_phone?: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: '無效的請求格式' }, { status: 400 }) }

  const { cert_id, from_phone, to_phone } = body
  if (!cert_id || !from_phone || !to_phone) {
    return NextResponse.json({ error: 'cert_id, from_phone, to_phone 為必填' }, { status: 400 })
  }
  if (from_phone === to_phone) {
    return NextResponse.json({ error: '不能移轉給自己' }, { status: 422 })
  }
  if (!/^09\d{8}$/.test(to_phone)) {
    return NextResponse.json({ error: '無效的接收人手機號碼' }, { status: 422 })
  }

  const sb = getSupabase()

  // 1. 查驗原始憑證
  const { data: cert, error: fetchErr } = await sb
    .from('tree_certificates')
    .select('*')
    .eq('id', cert_id)
    .eq('user_phone', from_phone)
    .eq('status', 'active')
    .single()

  if (fetchErr || !cert) {
    return NextResponse.json({ error: '找不到憑證或您沒有此憑證的所有權' }, { status: 404 })
  }

  // 2. 標記原始憑證為已移轉
  const now = new Date().toISOString()
  const { error: updateErr } = await sb
    .from('tree_certificates')
    .update({ status: 'transferred', transferred_at: now })
    .eq('id', cert_id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  // 3. 為接收人建立新憑證
  const newId = `${cert_id}-t${Date.now().toString(36)}`
  const newCertCode = `${cert.cert_code}-T`
  const { data: newCert, error: insertErr } = await sb
    .from('tree_certificates')
    .insert([{
      id:              newId,
      user_phone:      to_phone,
      original_phone:  cert.original_phone,
      order_id:        cert.order_id,
      event_id:        cert.event_id,
      event_title:     cert.event_title,
      tree_species:    cert.tree_species,
      forest_location: cert.forest_location,
      cert_code:       newCertCode,
      issued_at:       cert.issued_at,   // 樹齡從原始種植日算起
      status:          'active',
      source_cert_id:  cert_id,
      transferred_at:  null,
    }])
    .select()
    .single()

  if (insertErr) {
    // Rollback: restore original cert status
    await sb.from('tree_certificates').update({ status: 'active', transferred_at: null }).eq('id', cert_id)
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // 4. 清除雙方快取
  await Promise.all([cacheDel(`certs:${from_phone}`), cacheDel(`certs:${to_phone}`)])

  return NextResponse.json({ ok: true, new_cert_id: newCert.id })
}
