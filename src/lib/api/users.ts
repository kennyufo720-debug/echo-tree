// ╔══════════════════════════════════════════════════════╗
// ║  MODULE: Users（使用者認證與資料）                      ║
// ║  修改此檔案來變更登入/驗證/點數邏輯                       ║
// ╚══════════════════════════════════════════════════════╝

const BASE = '/api/users'

export interface UserProfile {
  id: string
  phone: string
  verified: boolean
  points: number
  created_at: string
}

export async function getUser(phone: string): Promise<UserProfile | null> {
  const res = await fetch(`${BASE}?phone=${encodeURIComponent(phone)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

export async function upsertUser(phone: string): Promise<UserProfile> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  })
  if (!res.ok) throw new Error('Failed to upsert user')
  return res.json()
}

export async function updateUser(phone: string, updates: Partial<Pick<UserProfile, 'verified' | 'points'>>): Promise<UserProfile> {
  const res = await fetch(BASE, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, ...updates }),
  })
  if (!res.ok) throw new Error('Failed to update user')
  return res.json()
}
