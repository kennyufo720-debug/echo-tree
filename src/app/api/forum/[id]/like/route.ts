// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Forum Like — POST /api/forum/[id]/like   ║
// ║  [MODULE: Forum] 按讚（冪等，回傳最新 likes 數）        ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = getSupabase()

  const { data: post } = await sb.from('forum_posts').select('likes').eq('id', id).single()
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const newLikes = (post.likes ?? 0) + 1
  await sb.from('forum_posts').update({ likes: newLikes }).eq('id', id)

  return NextResponse.json({ likes: newLikes })
}
