import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

// POST /api/points  { phone, delta, type?, description? }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phone, delta, type, description } = body
  if (!phone || delta === undefined) {
    return NextResponse.json({ error: 'phone and delta required' }, { status: 400 })
  }

  const sb = getSupabase()

  const { data: user, error: userErr } = await sb
    .from('users').select('points').eq('phone', phone).single()
  if (userErr) return NextResponse.json({ error: 'user not found' }, { status: 404 })

  const newPoints = Math.max(0, (user.points ?? 0) + delta)

  const { error: updateErr } = await sb
    .from('users').update({ points: newPoints }).eq('phone', phone)
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  await sb.from('point_transactions').insert([{
    user_phone: phone,
    type: type ?? (delta > 0 ? 'earn' : 'redeem'),
    description: description ?? (delta > 0 ? '點數獲得' : '點數兌換'),
    points: Math.abs(delta),
  }])

  return NextResponse.json({ points: newPoints })
}

// GET /api/points?phone=...
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('point_transactions')
    .select('*')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
