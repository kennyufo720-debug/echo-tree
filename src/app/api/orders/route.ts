// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Orders — GET/POST /api/orders            ║
// ║  [MODULE: Tickets] 訂單列表與新增                    ║
// ║  購票成功後自動批量產生樹憑證 (1 座位 = 1 憑證)       ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { cacheGet, cacheSet, cacheDel } from '@/lib/cache'

// GET /api/orders?phone=0912345678
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const ck = `orders:${phone}`
  const cached = await cacheGet(ck)
  if (cached) return NextResponse.json(cached)

  const { data, error } = await getSupabase()
    .from('orders')
    .select('id, user_phone, event_id, event_title, event_date, event_venue, seats, total_amount, status, ticket_code, created_at')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await cacheSet(ck, data ?? [], 10)
  return NextResponse.json(data ?? [])
}

// ── 樹種 / 種植地點對應表 ──────────────────────────────
interface TreeInfo { species: string; location: string }
function pickTree(eventTitle: string): TreeInfo {
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

// POST /api/orders
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ error: '無效的請求格式' }, { status: 400 }) }

  const sb = getSupabase()

  // ── 建立訂單 ──────────────────────────────────────────
  const { data: order, error } = await sb
    .from('orders')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ── 自動產生樹憑證（每張座位 = 一張憑證） ─────────────
  const seats: unknown[] = Array.isArray(body.seats) ? body.seats : []
  if (seats.length > 0 && body.user_phone && body.event_title) {
    const { species, location } = pickTree(String(body.event_title))
    const year = new Date().getFullYear()
    const abbrev = String(body.event_title)
      .replace(/[^a-zA-Z0-9一-鿿]/g, '')
      .slice(0, 4)
      .toUpperCase()

    const certRows = seats.map((_, idx) => {
      const seq = String(idx + 1).padStart(3, '0')
      return {
        id:              `cert-${order.id}-${seq}`,
        user_phone:      String(body.user_phone),
        original_phone:  String(body.user_phone),
        order_id:        order.id,
        event_id:        String(body.event_id ?? ''),
        event_title:     String(body.event_title),
        tree_species:    species,
        forest_location: location,
        cert_code:       `TREE-${abbrev}-${year}-${order.id.slice(-6).toUpperCase()}-${seq}`,
        status:          'active',
      }
    })

    // Best-effort: don't fail the order if cert generation errors
    await sb.from('tree_certificates').insert(certRows).then(
      ({ error: certErr }) => {
        if (certErr) console.error('[tree_certificates] insert failed:', certErr.message)
      }
    )

    // Bust cert cache so wallet refreshes immediately
    await cacheDel(`certs:${body.user_phone}`)
  }

  // ── 清除訂單快取 ──────────────────────────────────────
  if (body.user_phone) await cacheDel(`orders:${body.user_phone}`)

  return NextResponse.json(order, { status: 201 })
}
