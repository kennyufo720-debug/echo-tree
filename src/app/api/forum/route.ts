// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Forum — GET/POST /api/forum              ║
// ║  [MODULE: Forum] 論壇文章列表與新增                    ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { cacheGet, cacheSet, cacheDelPattern } from '@/lib/cache'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const FALLBACK_POSTS = [
  { id: 'p1', title: 'PSY 濕身演唱會 — 強烈建議帶換洗衣物！！', content: '昨晚去看了 PSY 演唱會，超級濕身，整個人都淋透了，記得帶換洗衣物！', author: '林大地', author_avatar: '', category: '活動討論', tags: ['PSY', '濕身'], likes: 127, views: 4521, pinned: false, hot: true, created_at: '2026-05-20T10:00:00Z' },
  { id: 'p3', title: '回音森林名人堂第一名達成！分享種樹心得 ', content: '今天終於衝上名人堂第一名了！分享我的種樹心得給大家。', author: '葉綠青', author_avatar: '', category: '粉絲心得', tags: ['ESG', '森林'], likes: 203, views: 8901, pinned: true, hot: true, created_at: '2026-05-18T14:30:00Z' },
  { id: 'p5', title: '每買一張票就種一棵樹 — Echo Tree ESG 機制超詳細解說', content: '今天來解說一下 Echo Tree 的 ESG 機制，讓更多人了解我們的環保行動。', author: 'Echo官方', author_avatar: '', category: 'ESG 行動', tags: ['ESG', '環保'], likes: 456, views: 12300, pinned: true, hot: true, created_at: '2026-05-10T09:00:00Z' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  // Skip cache for free-text searches — results are highly variable
  const ck = search ? null : `forum:${category ?? 'all'}`
  if (ck) {
    const cached = await cacheGet(ck)
    if (cached) return NextResponse.json(cached)
  }

  try {
    let query = getSupabase().from('forum_posts').select('id, title, author, author_avatar, category, content, tags, views, likes, replies, pinned, hot, created_at')
    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)
    query = query.order('pinned', { ascending: false }).order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    if (ck) await cacheSet(ck, data ?? [], 20)  // 20 s — new posts appear quickly
    return NextResponse.json(data ?? [])
  } catch {
    let posts = FALLBACK_POSTS
    if (category) posts = posts.filter(p => p.category === category)
    if (search) posts = posts.filter(p => p.title.includes(search))
    return NextResponse.json(posts)
  }
}

export async function POST(req: NextRequest) {
  // Rate-limit: 5 posts per IP per hour
  const ip = getClientIp(req.headers)
  const { allowed } = await checkRateLimit(`forum-post:${ip}`, 5, 3600)
  if (!allowed) {
    return NextResponse.json({ error: '發文次數過多，請稍後再試' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ error: '無效的請求格式' }, { status: 400 }) }

  const { author_avatar = '', tags = [] } = body
  // Strip HTML tags to prevent stored XSS
  const strip = (v: unknown) => String(v ?? '').replace(/<[^>]*>/g, '').trim()
  const title    = strip(body.title)
  const content  = strip(body.content)
  const author   = strip(body.author)
  const category = strip(body.category)

  if (!title || !content || !author || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Input length caps
  if (title.length > 100)    return NextResponse.json({ error: '標題最多 100 字' }, { status: 422 })
  if (content.length > 5000) return NextResponse.json({ error: '內容最多 5000 字' }, { status: 422 })
  if (author.length > 50)    return NextResponse.json({ error: '作者名稱過長' }, { status: 422 })

  const id = `p${Date.now()}`
  const { data, error } = await getSupabase()
    .from('forum_posts')
    .insert([{ id, title, content, author, author_avatar, category, tags, likes: 0, views: 0, pinned: false, hot: false }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // New post → wipe all forum list caches so it appears immediately
  await cacheDelPattern('forum:*')

  return NextResponse.json(data, { status: 201 })
}
