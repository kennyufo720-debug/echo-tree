// ╔══════════════════════════════════════════════════════╗
// ║  MODULE: Store（點數商城）                             ║
// ║  修改此檔案來變更商品清單/兌換流程                        ║
// ╚══════════════════════════════════════════════════════╝

const BASE = '/api/store'

export interface RewardItem {
  id: string
  name: string
  description: string
  points: number
  stock: number
  category: string
  emoji: string
  bg: string
  image?: string
  popular: boolean
  limited: boolean
  is_new: boolean
}

export interface StoreOrder {
  id: string
  user_phone: string
  item_id: string
  name: string
  image: string
  points: number
  created_at: string
}

export async function fetchRewardItems(): Promise<RewardItem[]> {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error('Failed to fetch store items')
  return res.json()
}

export async function redeemItem(phone: string, itemId: string): Promise<{ order: StoreOrder; remaining_points: number }> {
  const res = await fetch(`${BASE}/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, item_id: itemId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Redeem failed' }))
    throw new Error(err.error ?? 'Redeem failed')
  }
  return res.json()
}

export async function getStoreOrders(phone: string): Promise<StoreOrder[]> {
  const res = await fetch(`${BASE}/orders?phone=${encodeURIComponent(phone)}`)
  if (!res.ok) throw new Error('Failed to fetch store orders')
  return res.json()
}
