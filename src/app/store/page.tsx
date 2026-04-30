'use client'
import { useState, useEffect, useMemo } from 'react'
import { ShoppingBag, X, Flame, Search, Check, ShoppingCart, Plus, Minus, Trash2, Tag, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser, setUser } from '@/lib/store'

// ── Types ──────────────────────────────────────────────────────────────
interface MerchItem {
  id: string
  name: string
  image: string
  points: number   // 欄位沿用，但現在代表 NT$ 售價
  tag: string
  tagColor: string
  description: string
  stock: number
}

interface CartEntry { item: MerchItem; qty: number }

interface StoreOrder {
  id: string
  items: { name: string; image: string; qty: number; price: number }[]
  subtotal: number
  discount: number
  total: number
  pointsUsed: number
  at: string
}

// ── Constants ──────────────────────────────────────────────────────────
const ADMIN_KEY  = 'echotree_admin_config'
const ORDERS_KEY = 'echotree_store_orders'
// 1 點 = NT$0.1  →  NT$X 折抵 = X×10 點
const POINT_RATE = 10  // 每 NT$1 折抵消耗 10 點
const DISCOUNT_PCT = 0.1  // 10%

const DEFAULT_MERCHS: MerchItem[] = [
  { id: 'm1', name: '限定帆布袋',    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', points: 490,  tag: '熱門', tagColor: '#f97316', description: '回音樹限定環保帆布袋，附品牌印花，採用再生材質製作。', stock: 50 },
  { id: 'm2', name: '刺繡徽章組',    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', points: 290,  tag: '新品', tagColor: '#8b5cf6', description: '精緻刺繡徽章 5 入組，涵蓋回音樹各場次主題設計。', stock: 120 },
  { id: 'm3', name: '演唱會手環',    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80', points: 199,  tag: '限量', tagColor: '#ec4899', description: '螢光矽膠手環，演唱會限定配色，僅在活動期間開放兌換。', stock: 80 },
  { id: 'm4', name: 'ESG 種樹證書',  image: 'https://images.unsplash.com/photo-1542601906897-edc9b0d6be72?w=600&q=80', points: 780,  tag: 'ESG',  tagColor: '#10b981', description: '印有你名字的種樹座標證書，加入回音森林名人堂。', stock: 200 },
  { id: 'm5', name: '限定 Tee 上衣', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', points: 1480, tag: '限量', tagColor: '#ec4899', description: '100% 有機棉 T-Shirt，回音樹 2026 巡演限定款，尺碼 S–XL。', stock: 30 },
  { id: 'm6', name: '音樂節馬克杯',  image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80', points: 590,  tag: '熱門', tagColor: '#f97316', description: '陶瓷馬克杯 350ml，雙面印刷回音樹 Logo，微波爐安全。', stock: 60 },
  { id: 'm7', name: '折疊雨傘',      image: 'https://images.unsplash.com/photo-1558618047-3c5c3a4ed6c6?w=600&q=80', points: 980,  tag: '實用', tagColor: '#3b82f6', description: '超輕量折疊傘，附收納袋，抗UV塗層，直徑 100cm。', stock: 40 },
]

function loadMerchs(): MerchItem[] {
  if (typeof window === 'undefined') return DEFAULT_MERCHS
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_KEY) ?? '{}')
    return saved.merchs ?? DEFAULT_MERCHS
  } catch { return DEFAULT_MERCHS }
}

function saveOrder(o: StoreOrder) {
  try {
    const prev = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]')
    localStorage.setItem(ORDERS_KEY, JSON.stringify([o, ...prev].slice(0, 100)))
  } catch { /* noop */ }
}

const fmt = (n: number) => `NT$${n.toLocaleString()}`

// ── Component ──────────────────────────────────────────────────────────
export default function StorePage() {
  const user = useUser()
  const [items, setItems]         = useState<MerchItem[]>([])
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<MerchItem | null>(null)
  const [cart, setCart]           = useState<CartEntry[]>([])
  const [cartOpen, setCartOpen]   = useState(false)
  const [usePoints, setUsePoints] = useState(false)
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    setItems(loadMerchs())
    const h = () => setItems(loadMerchs())
    window.addEventListener('storage', h)
    return () => window.removeEventListener('storage', h)
  }, [])

  // ── Cart calculations ─────────────────────────────────────────────
  const subtotal   = useMemo(() => cart.reduce((s, e) => s + e.item.points * e.qty, 0), [cart])
  const maxDiscount = Math.floor(subtotal * DISCOUNT_PCT)
  // max spendable points → NT$ equivalent
  const pointsWorth = Math.floor(user.points / POINT_RATE)
  const discount   = usePoints ? Math.min(maxDiscount, pointsWorth) : 0
  const total      = subtotal - discount
  const pointsNeeded = discount * POINT_RATE
  const cartCount  = cart.reduce((s, e) => s + e.qty, 0)

  const filtered = items.filter(i =>
    i.name.includes(search) || i.description.includes(search) || i.tag.includes(search)
  )

  // ── Cart helpers ──────────────────────────────────────────────────
  function addToCart(item: MerchItem) {
    setCart(prev => {
      const ex = prev.find(e => e.item.id === item.id)
      if (ex) return prev.map(e => e.item.id === item.id ? { ...e, qty: Math.min(e.qty + 1, item.stock) } : e)
      return [...prev, { item, qty: 1 }]
    })
    setSelected(null)
    setCartOpen(true)
  }

  function setQty(id: string, qty: number) {
    if (qty <= 0) setCart(prev => prev.filter(e => e.item.id !== id))
    else setCart(prev => prev.map(e => e.item.id === id ? { ...e, qty } : e))
  }

  function checkout() {
    if (cart.length === 0) return
    // Deduct points if used
    if (usePoints && pointsNeeded > 0) {
      setUser({ points: user.points - pointsNeeded })
    }
    // Save order
    const order: StoreOrder = {
      id: Date.now().toString(),
      items: cart.map(e => ({ name: e.item.name, image: e.item.image, qty: e.qty, price: e.item.points })),
      subtotal,
      discount,
      total,
      pointsUsed: usePoints ? pointsNeeded : 0,
      at: new Date().toLocaleString('zh-TW'),
    }
    saveOrder(order)
    // Update stock visually
    setItems(prev => prev.map(i => {
      const ce = cart.find(e => e.item.id === i.id)
      return ce ? { ...i, stock: Math.max(0, i.stock - ce.qty) } : i
    }))
    setCart([])
    setUsePoints(false)
    setCartOpen(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400&q=40')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-4 border border-white/20">
            <Flame className="h-4 w-4 text-orange-400" /> 限量商城 · 台幣購買 · 點數折抵
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">🌲 回音樹 限量商城</h1>
          <p className="text-emerald-200 text-sm md:text-base mb-6 max-w-lg mx-auto">
            限定周邊、ESG 紀念品 — 每件皆有故事，點數可折抵 10%
          </p>
          <div className="inline-flex items-center gap-4 bg-white/10 border border-white/20 backdrop-blur rounded-2xl px-5 py-2.5">
            <div className="text-center">
              <div className="text-xl font-black text-emerald-300">{user.points.toLocaleString()}</div>
              <div className="text-xs text-white/60">可用點數</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-xl font-black text-amber-300">{fmt(Math.floor(user.points / POINT_RATE))}</div>
              <div className="text-xs text-white/60">最高可折抵</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="搜尋商品..." className="pl-9 bg-gray-50" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="text-sm text-gray-500 shrink-0 hidden sm:block">{filtered.length} 件商品</span>
          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-sm font-bold transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            購物車
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 rounded-full text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Success toast ──────────────────────────────────────────── */}
      {success && (
        <div className="container mx-auto px-4 pt-5">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
            <Check className="h-4 w-4 shrink-0" /> 訂單成立！感謝您的購買，可至會員後台查看訂單紀錄。
          </div>
        </div>
      )}

      {/* ── Product grid ───────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => {
            const isSoldOut = item.stock <= 0
            const inCart = cart.find(e => e.item.id === item.id)
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-emerald-200 hover:-translate-y-0.5"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.image} alt={item.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isSoldOut ? 'grayscale opacity-50' : ''}`}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow" style={{ background: item.tagColor }}>
                      {item.tag}
                    </span>
                  </div>
                  {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-white font-black text-sm tracking-widest">已售罄</span>
                    </div>
                  )}
                  {inCart && (
                    <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      已加入 ×{inCart.qty}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{item.name}</div>
                  <div className="text-xs text-gray-400 line-clamp-1 mb-2">{item.description}</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-emerald-600 font-black text-base leading-none">{fmt(item.points)}</div>
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

      {/* ── Detail Modal ───────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setSelected(null)}>
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative h-56 md:h-64 bg-gray-100 overflow-hidden">
              <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white">
                <X className="h-4 w-4" />
              </button>
              <div className="absolute top-3 left-3">
                <span className="text-white text-xs font-bold px-3 py-1 rounded-full shadow" style={{ background: selected.tagColor }}>{selected.tag}</span>
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-black text-gray-900 mb-1">{selected.name}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{selected.description}</p>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
                <div>
                  <div className="text-2xl font-black text-emerald-600">{fmt(selected.points)}</div>
                  <div className="text-xs text-gray-400">售價</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-amber-600">{fmt(Math.floor(selected.points * DISCOUNT_PCT))}</div>
                  <div className="text-xs text-gray-400">點數可折抵 10%</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-700">{selected.stock}</div>
                  <div className="text-xs text-gray-400">剩餘庫存</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>取消</Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  disabled={selected.stock <= 0}
                  onClick={() => addToCart(selected)}
                >
                  {selected.stock <= 0 ? '已售罄' : '加入購物車'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cart Drawer ────────────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-black text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-600" /> 購物車
                {cartCount > 0 && <span className="text-sm font-normal text-gray-400">({cartCount} 件)</span>}
              </h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">購物車是空的</p>
                  <button onClick={() => setCartOpen(false)} className="mt-3 text-xs text-emerald-600 hover:underline">繼續選購</button>
                </div>
              ) : (
                cart.map(({ item, qty }) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{item.name}</div>
                      <div className="text-emerald-600 font-black text-sm">{fmt(item.points)}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setQty(item.id, qty - 1)} className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100">
                        {qty === 1 ? <Trash2 className="h-3 w-3 text-red-400" /> : <Minus className="h-3 w-3" />}
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{qty}</span>
                      <button onClick={() => setQty(item.id, Math.min(qty + 1, item.stock))} className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary & checkout */}
            {cart.length > 0 && (
              <div className="border-t px-4 py-4 space-y-3 bg-white">
                {/* Points toggle */}
                <button
                  onClick={() => setUsePoints(v => !v)}
                  className={`w-full flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors text-sm font-medium ${usePoints ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-amber-200'}`}
                >
                  <Tag className={`h-4 w-4 ${usePoints ? 'text-amber-500' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left">使用點數折抵 10%</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${usePoints ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-500'}`}>
                    {usePoints ? `省 ${fmt(discount)}` : `可省 ${fmt(maxDiscount)}`}
                  </span>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${usePoints ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}`}>
                    {usePoints && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                </button>
                {usePoints && (
                  <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 flex justify-between">
                    <span>消耗 {pointsNeeded.toLocaleString()} 點（剩餘 {(user.points - pointsNeeded).toLocaleString()} 點）</span>
                    {user.points < pointsNeeded && <span className="text-red-500 font-bold">點數不足</span>}
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>商品小計</span><span>{fmt(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-amber-600 font-medium">
                      <span>點數折抵 10%</span><span>-{fmt(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-base pt-1 border-t">
                    <span>應付金額</span><span className="text-emerald-600">{fmt(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-5"
                  disabled={usePoints && user.points < pointsNeeded}
                  onClick={checkout}
                >
                  確認結帳 {fmt(total)}
                </Button>

                <button onClick={() => setCartOpen(false)} className="w-full text-center text-xs text-gray-400 hover:text-gray-600">
                  繼續選購 <ChevronRight className="h-3 w-3 inline" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
