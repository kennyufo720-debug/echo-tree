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
  await cacheSet(ck, data ?? [], 10)  // 10 s — invalidated immediately on POST
  return NextResponse.json(data ?? [])
}

// POST /api/orders
export async function POST(req: NextRequest) {
  const body = await req.json()

  const { data, error } = await getSupabase()
    .from('orders')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // New order placed — bust this user's order cache so tickets page refreshes
  if (body.user_phone) await cacheDel(`orders:${body.user_phone}`)

  return NextResponse.json(data, { status: 201 })
}
