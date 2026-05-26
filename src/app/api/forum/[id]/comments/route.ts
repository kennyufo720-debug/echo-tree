// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Forum Comments — GET/POST                ║
// ║  GET  /api/forum/[id]/comments                       ║
// ║  POST /api/forum/[id]/comments                       ║
// ║  [MODULE: Forum]                                     ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getSupabase()
    .from('forum_comments')
    .select('id, post_id, author, author_avatar, content, likes, created_at')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { author, author_avatar = '', content } = await req.json()

  if (!author || !content) {
    return NextResponse.json({ error: 'author and content required' }, { status: 400 })
  }

  const { data, error } = await getSupabase()
    .from('forum_comments')
    .insert([{ post_id: id, author, author_avatar, content, likes: 0 }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
