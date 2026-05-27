// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Certificates — GET /api/certificates     ║
// ║  [MODULE: ESG] 查詢會員樹憑證票夾                    ║
// ╚══════════════════════════════════════════════════════╝
//
// GET  /api/certificates?phone=09xxxxxxxx
//   → 回傳該手機號碼目前持有的所有 active 憑證（含計算後 co2_kg）

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { cacheGet, cacheSet } from '@/lib/cache'

/** 依種植日推算目前累積固碳量（粗估：每天 0.05 kg，上限視樹種調整） */
function calcCo2(issuedAt: string, species: string): number {
  const days = Math.floor((Date.now() - new Date(issuedAt).getTime()) / 86_400_000)
  const ratePerDay =
    species.includes('扁柏') ? 0.07 :
    species.includes('欒樹') ? 0.06 :
    species.includes('梅')   ? 0.04 :
    0.05
  return parseFloat((days * ratePerDay).toFixed(1))
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const ck = `certs:${phone}`
  const cached = await cacheGet(ck)
  if (cached) return NextResponse.json(cached)

  const { data, error } = await getSupabase()
    .from('tree_certificates')
    .select('id, user_phone, original_phone, order_id, event_id, event_title, tree_species, forest_location, cert_code, issued_at, status, source_cert_id, transferred_at')
    .eq('user_phone', phone)
    .eq('status', 'active')
    .order('issued_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with computed co2
  const enriched = (data ?? []).map(c => ({
    ...c,
    co2_kg: calcCo2(c.issued_at, c.tree_species),
  }))

  await cacheSet(ck, enriched, 30)
  return NextResponse.json(enriched)
}
