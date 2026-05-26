// ╔══════════════════════════════════════════════════════╗
// ║  MODULE: Events（演唱會活動）                          ║
// ║  修改此檔案來變更活動資料的讀取邏輯                       ║
// ╚══════════════════════════════════════════════════════╝

import { Event } from '@/lib/types'

const BASE = '/api/events'

export async function fetchEvents(params?: {
  category?: string
  city?: string
  status?: string
}): Promise<Event[]> {
  const qs = new URLSearchParams()
  if (params?.category && params.category !== 'all') qs.set('category', params.category)
  if (params?.city && params.city !== '全部城市') qs.set('city', params.city)
  if (params?.status) qs.set('status', params.status)
  const res = await fetch(`${BASE}${qs.size ? '?' + qs : ''}`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export async function fetchEvent(id: string): Promise<Event | null> {
  const res = await fetch(`${BASE}/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch event')
  return res.json()
}
