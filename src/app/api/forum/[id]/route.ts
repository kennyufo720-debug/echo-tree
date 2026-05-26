// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Forum — GET /api/forum/[id]              ║
// ║  [MODULE: Forum] 讀取單篇文章（自動+1 views）           ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = getSupabase()

  const { data, error } = await sb.from('forum_posts').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Increment views (fire-and-forget)
  sb.from('forum_posts').update({ views: (data.views ?? 0) + 1 }).eq('id', id).then(() => {})

  return NextResponse.json(data)
}
