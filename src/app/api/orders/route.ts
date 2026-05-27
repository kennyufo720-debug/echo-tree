import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { cacheGet, cacheSet, cacheDel } from '@/lib/cache'
import { readVerifiedCookie, verifySignedToken, CheckoutSession } from '@/lib/security/session'

// GET /api/orders?phone=0912345678
export async function GET(req: NextRequest) {
  const session = readVerifiedCookie(req.headers.get('cookie'))
  if (!session?.phone) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  const phone = session.phone

  const ck = `orders:${phone}`
  const cached = await cacheGet(ck)
  if (cached) return NextResponse.json(cached)

  const { data, error } = await getSupabase()
    .from('orders')
    .select('id, user_phone, event_id, event_title, event_date, event_venue, seats, total_amount, status, ticket_code, created_at')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 500 })
  await cacheSet(ck, data ?? [], 10)  // 10 s — invalidated immediately on POST
  return NextResponse.json(data ?? [])
}

// POST /api/orders
export async function POST(req: NextRequest) {
  const session = readVerifiedCookie(req.headers.get('cookie'))
  if (!session?.phone) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })

  const body = await req.json()
  const checkout = verifySignedToken<CheckoutSession>(body.session)
  if (!checkout || checkout.expiresAt < Date.now()) {
    return NextResponse.json({ error: 'INVALID_CHECKOUT_SESSION' }, { status: 400 })
  }

  const ticketCode = `TK-${Date.now().toString(36).toUpperCase()}`
  const safeOrder = {
    id: typeof body.id === 'string' ? body.id : `ORD-${Date.now()}`,
    user_phone: session.phone,
    event_id: checkout.eventId,
    event_title: checkout.eventTitle,
    event_date: checkout.eventDate,
    event_venue: checkout.eventVenue,
    seats: checkout.seats.map(s => ({
      section: s.sectionName,
      row: s.row,
      seat: s.seatNumber,
    })),
    total_amount: checkout.total,
    status: 'paid',
    ticket_code: ticketCode,
  }

  const { data, error } = await getSupabase()
    .from('orders')
    .insert([safeOrder])
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 500 })

  // New order placed — bust this user's order cache so tickets page refreshes
  await cacheDel(`orders:${session.phone}`)

  return NextResponse.json(data, { status: 201 })
}
