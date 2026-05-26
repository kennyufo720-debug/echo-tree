// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Events — GET /api/events                 ║
// ║  [MODULE: Events] 讀取所有演唱會活動                   ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { mockEvents } from '@/lib/mock-data'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category')
  const city = searchParams.get('city')
  const status = searchParams.get('status')

  try {
    let query = getSupabase().from('events').select(
      'id, title, artist, venue, city, date, time, image, category, price_from, price_to, total_seats, available_seats, status, tags, video_id, image_position'
    )
    if (category) query = query.eq('category', category)
    if (city) query = query.eq('city', city)
    if (status) query = query.eq('status', status)
    query = query.order('date', { ascending: true })

    const { data, error } = await query
    if (error) throw error

    // Map DB snake_case → frontend camelCase
    const events = (data ?? []).map(dbToEvent)
    return NextResponse.json(events)
  } catch {
    // Fallback to mock data if Supabase is not configured
    let events = mockEvents
    if (category) events = events.filter(e => e.category === category)
    if (city) events = events.filter(e => e.city === city)
    if (status) events = events.filter(e => e.status === status)
    return NextResponse.json(events)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToEvent(r: Record<string, any>) {
  return {
    id: r.id,
    title: r.title,
    artist: r.artist,
    venue: r.venue,
    city: r.city,
    date: r.date,
    time: r.time,
    image: r.image,
    category: r.category,
    priceFrom: r.price_from,
    priceTo: r.price_to,
    totalSeats: r.total_seats,
    availableSeats: r.available_seats,
    status: r.status,
    tags: r.tags ?? [],
    videoId: r.video_id,
    imagePosition: r.image_position,
  }
}
