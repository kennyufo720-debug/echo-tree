// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Events — GET /api/events/[id]            ║
// ║  [MODULE: Events] 讀取單一活動詳情                     ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { mockEvents } from '@/lib/mock-data'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const { data, error } = await getSupabase()
      .from('events')
      .select('id, title, artist, venue, city, date, time, image, category, price_from, price_to, total_seats, available_seats, status, tags, video_id, image_position')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      id: data.id, title: data.title, artist: data.artist,
      venue: data.venue, city: data.city, date: data.date, time: data.time,
      image: data.image, category: data.category,
      priceFrom: data.price_from, priceTo: data.price_to,
      totalSeats: data.total_seats, availableSeats: data.available_seats,
      status: data.status, tags: data.tags ?? [],
      videoId: data.video_id, imagePosition: data.image_position,
    })
  } catch {
    const event = mockEvents.find(e => e.id === id)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(event)
  }
}
