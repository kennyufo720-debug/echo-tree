// ╔══════════════════════════════════════════════════════╗
// ║  MODULE: Orders（票券訂單）                            ║
// ║  修改此檔案來變更購票/取票邏輯                            ║
// ╚══════════════════════════════════════════════════════╝

import { Order } from '@/lib/types'

const BASE = '/api/orders'

export async function getOrders(): Promise<Order[]> {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function createOrder(): Promise<Order> {
  throw new Error('Use signed checkout sessions to create orders')
}
