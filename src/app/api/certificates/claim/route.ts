// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Claim — POST /api/certificates/claim     ║
// ║  [MODULE: ESG] 手動兌換票券對應的樹憑證              ║
// ╚══════════════════════════════════════════════════════╝
//
// POST body: { order_id, user_phone, event_id, event_title, seat_count }
//
// 冪等設計：若同一 order_id 已有憑證，直接回傳現有憑證（不重複建立）

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { cacheDel } from '@/lib/cache'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// ── 樹種對應表（與 orders route 同步） ────────────────
function pickTree(eventTitle: string): { species: string; location: string } {
  if (/ESG|森林|永續|音樂節/i.test(eventTitle))
    return { species: '台灣扁柏', location: '南投縣仁愛鄉' }
  if (/Ann|夜之旋律|爵士/i.test(eventTitle))
    return { species: '台灣欒樹', location: '花蓮縣秀林鄉' }
  if (/林俊傑|JJ|明日座標/i.test(eventTitle))
    return { species: '台灣梅', location: '南投縣水里鄉' }
  if (/草東|滅火器|獨立|搖滾/i.test(eventTitle))
    return { species: '台灣杉', location: '宜蘭縣大同鄉' }
  if (/PSY|江南|K-Pop|KPOP/i.test(eventTitle))
    return { species: '光蠟樹', location: '屏東縣來義鄉' }
  if (/周杰倫|Jay|五月天|MAYDAY|茄子蛋/i.test(eventTitle))
    return { species: '台灣楓香', location: '嘉義縣阿里山鄉' }
  return { species: '台灣杉', location: '台東縣鹿野鄉' }
}

export async function POST(req: NextRequest) {
  // Rate limit: 20 claims per IP per hour
  const ip = getClientIp(req.headers)
  const { allowed } = await checkRateLimit(`cert-claim:${ip}`, 20, 3600)
  if (!allowed) return NextResponse.json({ error: '請求過於頻繁' }, { status: 429 })

  let body: { order_id?: string; user_phone?: string; event_id?: string; event_title?: string; seat_count?: number }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: '無效的請求格式' }, { status: 400 }) }

  const { order_id, user_phone, event_id = '', event_title = '', seat_count = 1 } = body
  if (!order_id || !user_phone) {
    return NextResponse.json({ error: 'order_id 與 user_phone 為必填' }, { status: 400 })
  }

  const sb = getSupabase()

  // ── 冪等檢查：此訂單是否已有憑證 ─────────────────────
  const { data: existing } = await sb
    .from('tree_certificates')
    .select('id, cert_code, tree_species, forest_location, issued_at, status')
    .eq('order_id', order_id)
    .eq('original_phone', user_phone)

  if (existing && existing.length > 0) {
    return NextResponse.json({ certs: existing, already_claimed: true })
  }

  // ── 建立憑證 ──────────────────────────────────────────
  const { species, location } = pickTree(event_title)
  const year   = new Date().getFullYear()
  const abbrev = event_title.replace(/[^a-zA-Z0-9一-鿿]/g, '').slice(0, 4).toUpperCase() || 'TREE'
  const count  = Math.min(Math.max(1, Number(seat_count)), 20)  // cap at 20

  const certRows = Array.from({ length: count }, (_, idx) => {
    const seq = String(idx + 1).padStart(3, '0')
    return {
      id:              `cert-${order_id}-${seq}`,
      user_phone,
      original_phone:  user_phone,
      order_id,
      event_id,
      event_title,
      tree_species:    species,
      forest_location: location,
      cert_code:       `TREE-${abbrev}-${year}-${order_id.slice(-6).toUpperCase()}-${seq}`,
      status:          'active',
    }
  })

  const { data: created, error } = await sb
    .from('tree_certificates')
    .insert(certRows)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 清除快取讓票夾即時更新
  await cacheDel(`certs:${user_phone}`)

  return NextResponse.json({ certs: created, already_claimed: false }, { status: 201 })
}
