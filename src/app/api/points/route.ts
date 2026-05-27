import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { readVerifiedCookie } from '@/lib/security/session'

// POST /api/points  { delta, type?, description? }
export async function POST(req: NextRequest) {
  const session = readVerifiedCookie(req.headers.get('cookie'))
  if (!session?.phone) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  const body = await req.json()
  const { delta, description } = body
  const phone = session.phone
  if (delta === undefined || typeof delta !== 'number' || delta >= 0) {
    return NextResponse.json({ error: 'INVALID_POINTS_DELTA' }, { status: 400 })
  }

  const sb = getSupabase()

  const { data: user, error: userErr } = await sb
    .from('users').select('points').eq('phone', phone).single()
  if (userErr) return NextResponse.json({ error: 'user not found' }, { status: 404 })

  const newPoints = Math.max(0, (user.points ?? 0) + delta)

  const [{ error: updateErr }] = await Promise.all([
    sb.from('users').update({ points: newPoints }).eq('phone', phone),
    sb.from('point_transactions').insert([{
      user_phone: phone,
      type: 'redeem',
      description: description ?? '點數兌換',
      points: Math.abs(delta),
    }]),
  ])
  if (updateErr) return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 500 })

  return NextResponse.json({ points: newPoints })
}

// GET /api/points?phone=...
export async function GET(req: NextRequest) {
  const session = readVerifiedCookie(req.headers.get('cookie'))
  if (!session?.phone) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  const phone = session.phone

  const { data, error } = await getSupabase()
    .from('point_transactions')
    .select('id, user_phone, type, description, points, created_at')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 500 })
  return NextResponse.json(data ?? [])
}
