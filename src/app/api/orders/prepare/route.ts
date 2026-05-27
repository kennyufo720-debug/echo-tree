import { NextRequest, NextResponse } from 'next/server'
import { mockEvents, mockSections } from '@/lib/mock-data'
import { CheckoutSeat, CheckoutSession, createSignedToken } from '@/lib/security/session'

interface RequestedSeat {
  sectionId?: string
  row?: string
  seatNumber?: number
}

function findSectionSeat(input: RequestedSeat): CheckoutSeat | null {
  if (!input.sectionId || !input.row || typeof input.seatNumber !== 'number') return null
  const section = mockSections.find(s => s.id === input.sectionId)
  if (!section) return null
  const row = section.rows.find(r => r.row === input.row)
  const seat = row?.seats.find(s => s.number === input.seatNumber)
  if (!seat || seat.status !== 'available') return null
  return {
    sectionId: section.id,
    sectionName: section.name,
    row: row!.row,
    seatNumber: seat.number,
    price: section.price,
  }
}

export async function POST(req: NextRequest) {
  let body: { eventId?: string; seats?: RequestedSeat[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 })
  }

  const event = mockEvents.find(e => e.id === body.eventId)
  if (!event) return NextResponse.json({ error: 'EVENT_NOT_FOUND' }, { status: 404 })
  if (event.status !== 'on-sale' || event.availableSeats <= 0) {
    return NextResponse.json({ error: 'EVENT_NOT_ON_SALE' }, { status: 409 })
  }

  const requested = Array.isArray(body.seats) ? body.seats : []
  if (requested.length < 1 || requested.length > 4) {
    return NextResponse.json({ error: 'INVALID_SEAT_COUNT' }, { status: 400 })
  }

  const seats = requested.map(findSectionSeat)
  if (seats.some(s => !s)) {
    return NextResponse.json({ error: 'INVALID_SEATS' }, { status: 400 })
  }

  const safeSeats = seats as CheckoutSeat[]
  const total = safeSeats.reduce((sum, seat) => sum + seat.price, 0)
  const payload: CheckoutSession = {
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventVenue: event.venue,
    seats: safeSeats,
    total,
    expiresAt: Date.now() + 10 * 60 * 1000,
  }

  return NextResponse.json({ session: createSignedToken(payload) })
}
