// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Forum — GET /api/forum/[id]              ║
// ║  [MODULE: Forum] 讀取單篇文章（自動+1 views）           ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { cacheGet, cacheSet } from '@/lib/cache'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const ck = `forum:post:${id}`
  const cached = await cacheGet(ck)

  const sb = getSupabase()

  if (cached) {
    // Increment views fire-and-forget even on cache hit (best-effort accuracy)
    sb.from('forum_posts').update({ views: (cached as { views?: number }).views ?? 0 + 1 }).eq('id', id).then(() => {})
    return NextResponse.json(cached)
  }

  const { data, error } = await sb
    .from('forum_posts')
    .select('id, title, author, author_avatar, category, content, tags, views, likes, replies, pinned, hot, created_at')
    .eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Increment views fire-and-forget
  sb.from('forum_posts').update({ views: (data.views ?? 0) + 1 }).eq('id', id).then(() => {})

  await cacheSet(ck, data, 20)  // 20 s — likes/replies may update; views are best-effort anyway
  return NextResponse.json(data)
}
