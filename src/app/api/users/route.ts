import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

// GET /api/users?phone=0912345678
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('users')
    .select('id, phone, email, verified, points, created_at, updated_at')
    .eq('phone', phone)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

// POST /api/users  { phone, verified?, points? }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phone, verified = false, points = 0 } = body
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('users')
    .upsert({ phone, verified, points }, { onConflict: 'phone', ignoreDuplicates: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/users  { phone, verified?, points? }
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { phone, ...updates } = body
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('phone', phone)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
