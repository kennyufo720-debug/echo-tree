// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Forest — GET /api/forest/[id]            ║
// ║  [MODULE: Forest] 單一藝人森林詳情                    ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await getSupabase()
    .from('artist_forests')
    .select('id, name, artist, trees, co2, fans, badge, zone, description, globe_x, globe_y, color, grad_from, grad_to, image, rank')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
