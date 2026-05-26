// ╔══════════════════════════════════════════════════════╗
// ║  MODULE: Points（忠誠點數系統）                         ║
// ║  修改此檔案來變更點數計算/兌換規則                        ║
// ╚══════════════════════════════════════════════════════╝

const BASE = '/api/points'

export interface PointTransaction {
  id: string
  user_phone: string
  type: 'earn' | 'redeem'
  description: string
  points: number
  created_at: string
}

export async function adjustPoints(
  phone: string,
  delta: number,
  description: string,
  type?: 'earn' | 'redeem',
): Promise<{ points: number }> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, delta, description, type }),
  })
  if (!res.ok) throw new Error('Failed to adjust points')
  return res.json()
}

export async function getPointHistory(phone: string): Promise<PointTransaction[]> {
  const res = await fetch(`${BASE}?phone=${encodeURIComponent(phone)}`)
  if (!res.ok) throw new Error('Failed to fetch point history')
  return res.json()
}
