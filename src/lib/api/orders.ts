// ╔══════════════════════════════════════════════════════╗
// ║  MODULE: Orders（票券訂單）                            ║
// ║  修改此檔案來變更購票/取票邏輯                            ║
// ╚══════════════════════════════════════════════════════╝

import { Order } from '@/lib/types'

const BASE = '/api/orders'

export async function getOrders(phone: string): Promise<Order[]> {
  const res = await fetch(`${BASE}?phone=${encodeURIComponent(phone)}`)
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      user_phone: order.ticketCode, // filled by caller with actual phone
      event_id: order.eventId,
      event_title: order.eventTitle,
      event_date: order.eventDate,
      event_venue: order.eventVenue,
      seats: order.seats,
      total_amount: order.totalAmount,
      status: order.status,
      ticket_code: order.ticketCode,
      created_at: new Date().toISOString(),
    }),
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}
