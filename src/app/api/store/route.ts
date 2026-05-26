// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Store — GET /api/store                   ║
// ║  [MODULE: Store] 商城商品清單                          ║
// ╚══════════════════════════════════════════════════════╝

import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('reward_items')
      .select('*')
      .gt('stock', 0)
      .order('popular', { ascending: false })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json(STORE_FALLBACK)
  }
}

// 若 Supabase 未設定，使用此 fallback（可在 Supabase 後台 reward_items 表新增/修改商品）
const STORE_FALLBACK = [
  { id: 'm1',  name: '限定帆布袋',          description: '回音樹官方限定帆布袋', points: 490,  stock: 50,  category: 'bag',       emoji: '👜', bg: 'from-orange-100 to-amber-50',   image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', popular: true,  limited: false, is_new: false },
  { id: 'm2',  name: '刺繡徽章組',          description: '3款主題刺繡徽章',       points: 290,  stock: 120, category: 'accessory', emoji: '📛', bg: 'from-purple-100 to-violet-50',  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', popular: false, limited: false, is_new: true  },
  { id: 'm3',  name: '演唱會手環',          description: '限量螢光手環',           points: 199,  stock: 80,  category: 'accessory', emoji: '💫', bg: 'from-pink-100 to-rose-50',      image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80', popular: false, limited: true,  is_new: false },
  { id: 'm10', name: 'AIWA 愛華 藍芽耳機', description: '聯名款高音質藍芽耳機',   points: 2980, stock: 30,  category: 'tech',      emoji: '🎧', bg: 'from-indigo-100 to-blue-50',    image: '/aiwa-earphone.jpeg',                                                    popular: true,  limited: true,  is_new: false },
  { id: 'm5',  name: '限定 Tee 上衣',       description: '回音樹官方限定Tee',      points: 1480, stock: 30,  category: 'clothing',  emoji: '👕', bg: 'from-pink-100 to-fuchsia-50',   image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', popular: false, limited: true,  is_new: false },
  { id: 'm8',  name: 'PSY X ECHO 滅火器',  description: 'PSY聯名款森林滅火器',    points: 2480, stock: 50,  category: 'collab',    emoji: '🧯', bg: 'from-sky-100 to-cyan-50',       image: '/psy-x-echo-extinguisher.jpg',                                           popular: true,  limited: true,  is_new: false },
  { id: 'm9',  name: 'echo tree 低碳T雪',  description: '低碳限量白色T恤',        points: 890,  stock: 60,  category: 'clothing',  emoji: '🌿', bg: 'from-green-100 to-emerald-50',  image: '/echo-tree-tee-white.jpg',                                               popular: false, limited: true,  is_new: true  },
]
