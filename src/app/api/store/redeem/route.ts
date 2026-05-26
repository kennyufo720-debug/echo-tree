// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Store Redeem — POST /api/store/redeem    ║
// ║  [MODULE: Store] 點數兌換商品（含庫存扣減）             ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { phone, item_id } = await req.json()
  if (!phone || !item_id) {
    return NextResponse.json({ error: 'phone and item_id required' }, { status: 400 })
  }

  const sb = getSupabase()

  // 1. 讀取商品（確認庫存 & 點數需求）
  const { data: item, error: itemErr } = await sb
    .from('reward_items').select('*').eq('id', item_id).single()
  if (itemErr || !item) return NextResponse.json({ error: '商品不存在' }, { status: 404 })
  if (item.stock <= 0) return NextResponse.json({ error: '商品已售完' }, { status: 400 })

  // 2. 讀取使用者點數
  const { data: user, error: userErr } = await sb
    .from('users').select('points').eq('phone', phone).single()
  if (userErr || !user) return NextResponse.json({ error: '使用者不存在' }, { status: 404 })
  if (user.points < item.points) return NextResponse.json({ error: '點數不足' }, { status: 400 })

  // 3. 扣點 + 扣庫存 + 建立兌換記錄（三步驟，Supabase 不支援 true transaction，依序執行）
  await sb.from('users').update({ points: user.points - item.points }).eq('phone', phone)
  await sb.from('reward_items').update({ stock: item.stock - 1 }).eq('id', item_id)

  const { data: order } = await sb
    .from('store_orders')
    .insert([{ user_phone: phone, item_id, name: item.name, image: item.image ?? '', points: item.points }])
    .select().single()

  await sb.from('point_transactions').insert([{
    user_phone: phone, type: 'redeem',
    description: `兌換：${item.name}`, points: item.points,
  }])

  return NextResponse.json({ order, remaining_points: user.points - item.points })
}
