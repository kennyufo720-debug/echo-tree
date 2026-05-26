// ╔══════════════════════════════════════════════════════╗
// ║  MODULE: Forum（論壇貼文與留言）                        ║
// ║  修改此檔案來變更論壇排版/分類/留言規則                    ║
// ╚══════════════════════════════════════════════════════╝

const BASE = '/api/forum'

export interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  author_avatar: string
  category: string
  tags: string[]
  likes: number
  views: number
  pinned: boolean
  hot: boolean
  created_at: string
}

export interface ForumComment {
  id: string
  post_id: string
  author: string
  author_avatar: string
  content: string
  likes: number
  created_at: string
}

export async function fetchPosts(params?: { category?: string; search?: string }): Promise<ForumPost[]> {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.search) qs.set('search', params.search)
  const res = await fetch(`${BASE}${qs.size ? '?' + qs : ''}`)
  if (!res.ok) throw new Error('Failed to fetch forum posts')
  return res.json()
}

export async function fetchPost(id: string): Promise<ForumPost | null> {
  const res = await fetch(`${BASE}/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch post')
  return res.json()
}

export async function fetchComments(postId: string): Promise<ForumComment[]> {
  const res = await fetch(`${BASE}/${postId}/comments`)
  if (!res.ok) throw new Error('Failed to fetch comments')
  return res.json()
}

export async function createPost(post: Omit<ForumPost, 'id' | 'likes' | 'views' | 'created_at'>): Promise<ForumPost> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  })
  if (!res.ok) throw new Error('Failed to create post')
  return res.json()
}

export async function createComment(postId: string, comment: Omit<ForumComment, 'id' | 'likes' | 'created_at' | 'post_id'>): Promise<ForumComment> {
  const res = await fetch(`${BASE}/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  })
  if (!res.ok) throw new Error('Failed to create comment')
  return res.json()
}

export async function likePost(id: string): Promise<{ likes: number }> {
  const res = await fetch(`${BASE}/${id}/like`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to like post')
  return res.json()
}
