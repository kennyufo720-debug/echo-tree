// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Forest — GET /api/forest                 ║
// ║  [MODULE: Forest] 藝人 ESG 森林排行清單               ║
// ╚══════════════════════════════════════════════════════╝

import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('artist_forests')
      .select('id, name, artist, trees, co2, fans, badge, zone, description, globe_x, globe_y, color, grad_from, grad_to, image, rank')
      .order('rank', { ascending: true })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    // Fallback: return seed data matching the schema
    return NextResponse.json(FOREST_FALLBACK)
  }
}

const FOREST_FALLBACK = [
  { id: 'jaychou', name: '周杰倫森林', artist: '周杰倫', trees: 203, co2: 5180, fans: 12480, badge: '森林傳奇', zone: '南投仁愛', description: '規模最大的藝人森林，南投仁愛的百年林地見證了傑倫音樂的傳奇歲月', globe_x: 62, globe_y: 52, color: '#d97706', grad_from: 'from-amber-400', grad_to: 'to-yellow-600', image: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&q=80', rank: 1 },
  { id: 'jjlin', name: '林俊杰森林', artist: '林俊杰', trees: 178, co2: 4530, fans: 8940, badge: '星光使者', zone: '新加坡 Punggol 生態森林', description: 'Punggol 生態森林坐落於新加坡東北部濱海綠廊', globe_x: 57, globe_y: 60, color: '#0284c7', grad_from: 'from-sky-400', grad_to: 'to-blue-600', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', rank: 2 },
  { id: 'tzuyu', name: '子瑜森林', artist: '周子瑜', trees: 156, co2: 3980, fans: 4820, badge: '守護天使', zone: '馬來西亞 吉蘭州 ACACIA 森林', description: 'ACACIA 森林為一處退化森林，適合進行永續森林再造', globe_x: 34, globe_y: 62, color: '#34d399', grad_from: 'from-emerald-300', grad_to: 'to-teal-500', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', rank: 3 },
  { id: 'huangzihongfan', name: '黃子弘凡森林', artist: '黃子弘凡', trees: 134, co2: 3421, fans: 3650, badge: '生態先鋒', zone: '花蓮秀林', description: '花蓮秀林的深邃林地，隨著每場演出持續擴張', globe_x: 68, globe_y: 40, color: '#059669', grad_from: 'from-green-400', grad_to: 'to-emerald-600', image: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=400&q=80', rank: 4 },
  { id: 'psy', name: 'PSY 森林', artist: 'PSY', trees: 89, co2: 2234, fans: 2310, badge: '國際先鋒', zone: '宜蘭大同', description: '橫跨韓台的國際森林，每棵樹都是一次跨文化的 ESG 行動', globe_x: 74, globe_y: 30, color: '#7c3aed', grad_from: 'from-violet-400', grad_to: 'to-purple-600', image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&q=80', rank: 5 },
]
