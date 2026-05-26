// ╔══════════════════════════════════════════════════════╗
// ║  MODULE: Forest（藝人 ESG 森林）                       ║
// ║  修改此檔案來變更森林排名/樹木計算方式                    ║
// ╚══════════════════════════════════════════════════════╝

const BASE = '/api/forest'

export interface ArtistForest {
  id: string
  name: string
  artist: string
  trees: number
  co2: number
  fans: number
  badge: string
  zone: string
  description: string
  globe_x: number
  globe_y: number
  color: string
  grad_from: string
  grad_to: string
  image: string
  rank: number
}

export async function fetchForests(): Promise<ArtistForest[]> {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error('Failed to fetch forests')
  return res.json()
}

export async function fetchForest(id: string): Promise<ArtistForest | null> {
  const res = await fetch(`${BASE}/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch forest')
  return res.json()
}
