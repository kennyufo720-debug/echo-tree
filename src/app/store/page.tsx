'use client'
import { useState, useEffect } from 'react'
import { ShoppingBag, X, Flame, Sparkles, Search, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useUser, setUser } from '@/lib/store'

// ── Types ──────────────────────────────────────────────────────────────
interface MerchItem {
  id: string
  name: string
  image: string
  points: number
  tag: string
  tagColor: string
  description: string
  stock: number
}

interface StoreOrder {
  id: string
  itemId: string
  name: string
  image: string
  points: number
  at: string
}

// ── Admin config key (same as admin page) ──────────────────────────────
const ADMIN_KEY   = 'echotree_admin_config'
const ORDERS_KEY  = 'echotree_store_orders'

const DEFAULT_MERCHS: MerchItem[] = [
  { id: 'm1', name: '限定帆布袋',   image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', points: 500,  tag: '熱門', tagColor: '#f97316', description: '回音樹限定環保帆布袋，附品牌印花，採用再生材質製作。', stock: 50 },
  { id: 'm2', name: '刺繡徽章組',   image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', points: 300,  tag: '新品', tagColor: '#8b5cf6', description: '精緻刺繡徽章 5 入組，涵蓋回音樹各場次主題設計。', stock: 120 },
  { id: 'm3', name: '演唱會手環',   image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80', points: 200,  tag: '限量', tagColor: '#ec4899', description: '螢光矽膠手環，演唱會限定配色，僅在活動期間開放兌換。', stock: 80 },
  { id: 'm4', name: 'ESG 種樹證書', image: 'https://images.unsplash.com/photo-1542601906897-edc9b0d6be72?w=600&q=80', points: 800,  tag: 'ESG',  tagColor: '#10b981', description: '印有你名字的種樹座標證書，加入回音森林名人堂。', stock: 200 },
  { id: 'm5', name: '限定 Tee 上衣', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', points: 1500, tag: '限量', tagColor: '#ec4899', description: '100% 有機棉 T-Shirt，回音樹 2026 巡演限定款，尺碼 S–XL。', stock: 30 },
  { id: 'm6', name: '音樂節馬克杯', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80', points: 600,  tag: '熱門', tagColor: '#f97316', description: '陶瓷馬克杯 350ml，雙面印刷回音樹 Logo，微波爐安全。', stock: 60 },
  { id: 'm7', name: '折疊雨傘',     image: 'https://images.unsplash.com/photo-1558618047-3c5c3a4ed6c6?w=600&q=80', points: 1000, tag: '實用', tagColor: '#3b82f6', description: '超輕量折疊傘，附收納袋，抗UV塗層，直徑 100cm。', stock: 40 },
]

function loadMerchs(): MerchItem[] {
  if (typeof window === 'undefined') return DEFAULT_MERCHS
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_KEY) ?? '{}')
    return saved.merchs ?? DEFAULT_MERCHS
  } catch { return DEFAULT_MERCHS }
}

function loadOrders(): StoreOrder[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]') } catch { return [] }
}

function saveOrder(o: StoreOrder) {
  const orders = loadOrders()
  localStorage.setItem(ORDERS_KEY, JSON.stringify([o, ...orders].slice(0, 100)))
}

// ── Component ──────────────────────────────────────────────────────────
export default function StorePage() {
  const user = useUser()
  const [items, setItems]           = useState<MerchItem[]>([])
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState<MerchItem | null>(null)
  const [purchased, setPurchased]   = useState<string[]>([])
  const [justBought, setJustBought] = useState<string | null>(null)

  useEffect(() => {
    setItems(loadMerchs())
    // Listen for admin changes
    const handler = () => setItems(loadMerchs())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    i.tag.toLowerCase().includes(search.toLowerCase())
  )

  function handleBuy(item: MerchItem) {
    if (user.points < item.points || item.stock <= 0) return
    setUser({ points: user.points - item.points })
    const order: StoreOrder = {
      id: Date.now().toString(),
      itemId: item.id,
      name: item.name,
      image: item.image,
      points: item.points,
      at: new Date().toLocaleString('zh-TW'),
    }
    saveOrder(order)
    setPurchased(p => [...p, item.id])
    setJustBought(item.id)
    setSelected(null)
    setTimeout(() => setJustBought(null), 3000)
    // Update local stock (visual only)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, stock: Math.max(0, i.stock - 1) } : i))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400&q=40')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-4 border border-white/20">
            <Flame className="h-4 w-4 text-orange-400" /> 限量商城 · 點數兌換
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            🌲 回音樹 限量商城
          </h1>
          <p className="text-emerald-200 text-base md:text-lg mb-6 max-w-xl mx-auto">
            用你的點數兌換限定周邊、體驗與 ESG 紀念品 — 每件商品皆有對應故事
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur rounded-2xl px-5 py-2.5">
            <span className="text-2xl font-black text-emerald-300">{user.points.toLocaleString()}</span>
            <span className="text-sm text-white/70">點可用</span>
          </div>
        </div>
      </div>

      {/* Search & count */}
      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋商品..."
              className="pl-9 bg-gray-50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-sm text-gray-500 shrink-0">{filtered.length} 件商品</span>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        {justBought && (
          <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
            <Check className="h-4 w-4 text-emerald-600" />
            兌換成功！商品已加入您的收藏
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filtered.map(item => {
            const canBuy = user.points >= item.points && item.stock > 0
            const isSoldOut = item.stock <= 0
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-emerald-200 hover:-translate-y-0.5"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  {/* Tag badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow"
                      style={{ background: item.tagColor }}>
                      {item.tag}
                    </span>
                  </div>
                  {/* Sold out overlay */}
                  {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-white font-black text-sm tracking-widest">已售罄</span>
                    </div>
                  )}
                  {/* Points not enough */}
                  {!isSoldOut && !canBuy && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      點數不足
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{item.name}</div>
                  <div className="text-xs text-gray-400 line-clamp-1 mb-2">{item.description}</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-emerald-600 font-black text-base leading-none">{item.points.toLocaleString()}</div>
                      <div className="text-gray-400 text-[10px]">點數</div>
                    </div>
                    <div className="text-xs text-gray-400">剩 {item.stock}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>找不到符合的商品</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative h-56 md:h-72 bg-gray-100 overflow-hidden">
              <img src={selected.image} alt={selected.name} className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none' }} />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white"
              ><X className="h-4 w-4" /></button>
              <div className="absolute top-3 left-3">
                <span className="text-white text-xs font-bold px-3 py-1 rounded-full shadow"
                  style={{ background: selected.tagColor }}>{selected.tag}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h2 className="text-xl font-black text-gray-900 mb-1">{selected.name}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{selected.description}</p>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
                <div>
                  <div className="text-2xl font-black text-emerald-600">{selected.points.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">需要點數</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-700">{user.points.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">你的點數</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-700">{selected.stock}</div>
                  <div className="text-xs text-gray-400">剩餘庫存</div>
                </div>
              </div>

              {user.points < selected.points && (
                <div className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mb-3">
                  ⚠️ 點數不足，還差 {(selected.points - user.points).toLocaleString()} 點。購票可累積點數。
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>取消</Button>
                <Button
                  className="flex-2 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  disabled={user.points < selected.points || selected.stock <= 0}
                  onClick={() => handleBuy(selected)}
                >
                  {selected.stock <= 0 ? '已售罄' : user.points < selected.points ? '點數不足' : `確認兌換 ${selected.points.toLocaleString()} 點`}
                </Button>
              </div>

              <button
                onClick={() => { setSelected(null); window.location.href = '/member' }}
                className="w-full text-center text-xs text-emerald-600 mt-3 hover:underline"
              >
                查看我的兌換紀錄 <ChevronRight className="h-3 w-3 inline" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
