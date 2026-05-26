// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Store Redeem — POST /api/store/redeem    ║
// ║  [MODULE: Store] 點數兌換商品（含庫存扣減）             ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { cacheDel } from '@/lib/cache'

export async function POST(req: NextRequest) {
  const { phone, item_id } = await req.json()
  if (!phone || !item_id) {
    return NextResponse.json({ error: 'phone and item_id required' }, { status: 400 })
  }

  const sb = getSupabase()

  // 1+2. Fetch item and user in parallel
  const [itemResult, userResult] = await Promise.all([
    sb.from('reward_items')
      .select('id, name, description, points, stock, category, emoji, bg, image, popular, limited, is_new')
      .eq('id', item_id).single(),
    sb.from('users').select('points').eq('phone', phone).single(),
  ])

  const { data: item, error: itemErr } = itemResult
  if (itemErr || !item) return NextResponse.json({ error: '商品不存在' }, { status: 404 })
  if (item.stock <= 0) return NextResponse.json({ error: '商品已售完' }, { status: 400 })

  const { data: user, error: userErr } = userResult
  if (userErr || !user) return NextResponse.json({ error: '使用者不存在' }, { status: 404 })
  if (user.points < item.points) return NextResponse.json({ error: '點數不足' }, { status: 400 })

  // 3+4. Deduct points and stock in parallel
  await Promise.all([
    sb.from('users').update({ points: user.points - item.points }).eq('phone', phone),
    sb.from('reward_items').update({ stock: item.stock - 1 }).eq('id', item_id),
  ])

  // 5+6. Create order record and log transaction in parallel
  const [orderResult] = await Promise.all([
    sb.from('store_orders')
      .insert([{ user_phone: phone, item_id, name: item.name, image: item.image ?? '', points: item.points }])
      .select('id, user_phone, item_id, name, image, points, created_at').single(),
    sb.from('point_transactions').insert([{
      user_phone: phone, type: 'redeem',
      description: `兌換：${item.name}`, points: item.points,
    }]),
  ])

  // Stock just changed — bust the store listing cache immediately
  await cacheDel('store')

  return NextResponse.json({ order: orderResult.data, remaining_points: user.points - item.points })
}
