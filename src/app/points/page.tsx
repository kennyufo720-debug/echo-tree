'use client'
import { useState, useMemo, useEffect } from 'react'
import { Coins, Gift, History, Star, ChevronRight, Check, Lock, Zap, Ticket, TreePine, ShoppingBag, Search, ShoppingCart, X, Plus, Minus, ChevronDown } from 'lucide-react'
import { useUser } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// ── Types ──────────────────────────────────────────────
interface RewardItem {
  id: string
  name: string
  desc: string
  points: number
  stock: number
  category: string
  emoji: string
  bg: string
  image?: string
  popular?: boolean
  limited?: boolean
  new?: boolean
}

interface CartItem extends RewardItem { qty: number }

// ── Data ──────────────────────────────────────────────
const USER_POINTS = 2450

const TIERS = [
  { name: '音符', min: 0, max: 999, icon: '' },
  { name: '旋律', min: 1000, max: 2999, icon: '' },
  { name: '和弦', min: 3000, max: 5999, icon: '' },
  { name: '交響', min: 6000, max: 9999, icon: '' },
  { name: '傳奇', min: 10000, max: Infinity, icon: '' },
]

const CATEGORIES = [
  { id: 'all', label: '全部', icon: '' },
  { id: 'discount', label: '票券折扣', icon: '' },
  { id: 'merch', label: '實體周邊', icon: '' },
  { id: 'tree', label: '樹資產', icon: '' },
  { id: 'experience', label: '體驗特權', icon: '' },
  { id: 'digital', label: '數位好禮', icon: '' },
]

const ITEMS: RewardItem[] = [
  // Discount（10點 = 1元）
  { id: 'd1', name: '購票折抵 NT$100', desc: '10點折抵1元 · 結帳時折抵 NT$100，無使用期限，全場次適用', points: 1000, stock: 50, category: 'discount', emoji: '🎟️', bg: 'from-emerald-400 to-teal-500', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80', popular: true },
  { id: 'd2', name: '購票折抵 NT$300', desc: '10點折抵1元 · 結帳時折抵 NT$300，無使用期限，全場次適用', points: 3000, stock: 20, category: 'discount', emoji: '🎟️', bg: 'from-emerald-500 to-green-600', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80' },
  { id: 'd3', name: '購票折抵 NT$500', desc: '10點折抵1元 · 單筆訂單折抵 NT$500，限定場次使用', points: 5000, stock: 10, category: 'discount', emoji: '🎟️', bg: 'from-teal-400 to-cyan-500', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80' },
  { id: 'd4', name: 'VIP 區免費升等', desc: '指定場次座位免費升等至 VIP 區，限量供應', points: 3000, stock: 5, category: 'discount', emoji: '👑', bg: 'from-amber-400 to-orange-500', image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&q=80', limited: true },
  { id: 'd5', name: '早鳥優先購票資格', desc: '指定場次提前 24 小時購票，限定會員', points: 800, stock: 30, category: 'discount', emoji: '⚡', bg: 'from-yellow-400 to-amber-500', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', new: true },
  // Merch
  { id: 'm1', name: 'Echo Goo 帆布袋', desc: '限定 ESG 主題帆布袋，環保材質，附品牌印花', points: 1000, stock: 25, category: 'merch', emoji: '👜', bg: 'from-pink-400 to-rose-500', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', popular: true },
  { id: 'm2', name: '回音樹限定徽章組', desc: '3 枚一組，含 ESG 主題徽章設計', points: 800, stock: 30, category: 'merch', emoji: '🏅', bg: 'from-purple-400 to-violet-500', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80' },
  { id: 'm3', name: '藝人簽名海報 A2', desc: '回音樹親筆簽名海報，附保護套', points: 2000, stock: 8, category: 'merch', emoji: '🎨', bg: 'from-rose-400 to-pink-500', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', limited: true },
  { id: 'm4', name: '限量紀念 T-shirt', desc: 'ESG 音樂節紀念款，S/M/L/XL，純棉材質', points: 2500, stock: 5, category: 'merch', emoji: '👕', bg: 'from-indigo-400 to-blue-500', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', limited: true },
  { id: 'm5', name: 'Echo Goo 馬克杯', desc: '雙層隔熱設計，含 Echo Goo 品牌 LOGO 烤印', points: 600, stock: 40, category: 'merch', emoji: '☕', bg: 'from-orange-400 to-amber-500', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80', new: true },
  { id: 'm6', name: '限定手機掛繩組', desc: '音符設計，附 3 款替換吊飾', points: 450, stock: 60, category: 'merch', emoji: '📱', bg: 'from-cyan-400 to-sky-500', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80' },
  // Tree
  { id: 't1', name: '植樹認養憑證（1棵）', desc: '認養一棵樹，獲得專屬編號憑證，列入回音森林名人堂', points: 1500, stock: 100, category: 'tree', emoji: '🌱', bg: 'from-green-400 to-emerald-500', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80' },
  { id: 't2', name: '回音森林命名樹', desc: '在回音森林地圖上擁有一棵以你名字命名的樹', points: 4000, stock: 20, category: 'tree', emoji: '🌳', bg: 'from-emerald-500 to-green-700', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', popular: true },
  { id: 't3', name: 'ESG 碳抵換憑證', desc: '官方認證碳抵換憑證，可用於企業 ESG 報告', points: 6000, stock: 10, category: 'tree', emoji: '📜', bg: 'from-teal-500 to-emerald-700', image: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&q=80', limited: true },
  { id: 't4', name: '植樹 x3 超值包', desc: '一次認養 3 棵樹，享有獨家紀念品一份', points: 3800, stock: 15, category: 'tree', emoji: '🌲', bg: 'from-lime-400 to-green-500', image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&q=80', new: true },
  // Experience
  { id: 'e1', name: '後台參觀體驗票', desc: '演出前 1 小時入場，近距離觀看舞台布置與排練', points: 5000, stock: 3, category: 'experience', emoji: '🎬', bg: 'from-amber-400 to-yellow-500', image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&q=80', limited: true },
  { id: 'e2', name: '演出前見面會資格', desc: '演出開始前與藝人 15 分鐘見面、拍照與簽名', points: 8000, stock: 2, category: 'experience', emoji: '🤝', bg: 'from-red-400 to-rose-500', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80', limited: true },
  { id: 'e3', name: 'VIP 包廂升等（雙人）', desc: '享有專屬雙人 VIP 包廂、飲料無限暢飲服務', points: 10000, stock: 1, category: 'experience', emoji: '🥂', bg: 'from-purple-500 to-violet-600', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&q=80', limited: true },
  { id: 'e4', name: '音響工程師一日體驗', desc: '跟隨音響工程師學習演唱會音響調音技術', points: 6500, stock: 2, category: 'experience', emoji: '🎛️', bg: 'from-slate-400 to-gray-600', image: 'https://images.unsplash.com/photo-1478737270197-2b10e62efd35?w=400&q=80', new: true },
  // Digital
  { id: 'dg1', name: 'Echo Goo Premium 月票', desc: '享有無廣告、優先購票通知、獨家直播等特權，有效期 30 天', points: 1200, stock: 999, category: 'digital', emoji: '⭐', bg: 'from-blue-400 to-indigo-500', image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&q=80', popular: true },
  { id: 'dg2', name: '數位專輯下載（回音樹）', desc: '回音樹最新專輯無損音質數位下載，含歌詞冊 PDF', points: 700, stock: 999, category: 'digital', emoji: '🎵', bg: 'from-violet-400 to-purple-500', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  { id: 'dg3', name: '獨家直播存檔觀看權', desc: '解鎖過去 3 場演唱會高畫質直播存檔，永久觀看', points: 900, stock: 999, category: 'digital', emoji: '📺', bg: 'from-sky-400 to-blue-500', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80', new: true },
  { id: 'dg4', name: '個人化數位藝術 NFT', desc: '由回音樹親自授權的獨一無二數位藝術品', points: 3500, stock: 50, category: 'digital', emoji: '🎨', bg: 'from-fuchsia-400 to-pink-500', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80', limited: true },
]

const HISTORY = [
  { id: 1, type: 'earn', desc: '購買回音樹ESG音樂節票券', points: +980, date: '2026-04-18' },
  { id: 2, type: 'earn', desc: '完成 KYC 驗證獎勵', points: +200, date: '2026-04-15' },
  { id: 3, type: 'redeem', desc: '兌換：購票折抵 NT$100', points: -500, date: '2026-04-10' },
  { id: 4, type: 'earn', desc: '首次購票獎勵', points: +300, date: '2026-03-22' },
  { id: 5, type: 'earn', desc: '分享活動至社群', points: +50, date: '2026-03-20' },
  { id: 6, type: 'redeem', desc: '兌換：回音樹限定徽章組', points: -800, date: '2026-03-15' },
  { id: 7, type: 'earn', desc: '活動評價獎勵', points: +100, date: '2026-03-10' },
  { id: 8, type: 'earn', desc: '邀請好友加入', points: +500, date: '2026-02-28' },
]

const EARN_WAYS = [
  { icon: '', text: '購票消費', sub: 'NT$1 = 1 點，自動累積' },
  { icon: '', text: 'KYC 驗證完成', sub: '首次驗證一次性 +200 點' },
  { icon: '', text: '分享活動', sub: '每次成功分享 +50 點' },
  { icon: '', text: '購買樹資產', sub: '每棵樹 +500 點' },
  { icon: '', text: '活動評價', sub: '完成評價 +100 點' },
  { icon: '', text: '邀請好友', sub: '成功邀請 +500 點/人' },
  { icon: '', text: '連續登入', sub: '7 天連續登入 +200 點' },
]

// ── Helpers ───────────────────────────────────────────
function getTier(pts: number) {
  return TIERS.find(t => pts >= t.min && pts <= t.max) ?? TIERS[0]
}
function getNextTier(pts: number) {
  return TIERS.find(t => t.min > pts) ?? null
}

// ── Sub-components ────────────────────────────────────
function ItemCard({ item, pts, onAdd, onDetail }: { item: RewardItem; pts: number; onAdd: () => void; onDetail: () => void }) {
  const canAfford = pts >= item.points
  return (
    <Card className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group" onClick={onDetail}>
      {/* 圖片區域 */}
      <div className={`h-28 bg-gradient-to-br ${item.bg} flex items-center justify-center relative overflow-hidden`}>
        {item.image ? (
          <>
            <img
              src={item.image}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
            {/* 漸層遮罩讓 emoji 清晰 */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent`} />
            {/* emoji 浮在圖片右下角 */}
            <span className="absolute bottom-2 right-2.5 text-2xl drop-shadow-lg">{item.emoji}</span>
          </>
        ) : (
          <span className="text-5xl">{item.emoji}</span>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {item.popular && <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">熱門</Badge>}
          {item.limited && <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">限量</Badge>}
          {item.new && <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0">新品</Badge>}
        </div>
        {item.stock <= 5 && item.stock > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            剩 {item.stock} 件
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{item.name}</p>
        <div className="flex items-center gap-1 mb-2.5">
          <Coins className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="font-bold text-emerald-600 text-sm">{item.points.toLocaleString()}</span>
          <span className="text-xs text-gray-400">點</span>
        </div>
        <Button
          size="sm"
          className={`w-full h-8 text-xs font-medium ${
            canAfford
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!canAfford}
          onClick={e => { e.stopPropagation(); onAdd() }}
        >
          {canAfford ? <><Plus className="h-3 w-3 mr-1" />加入兌換</> : <><Lock className="h-3 w-3 mr-1" />點數不足</>}
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Main Page ─────────────────────────────────────────
const ANYDEEE_URL = 'https://anydeee.com'
const TREE_IDS = new Set(['t1', 't2', 't3', 't4'])

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState<'store' | 'history' | 'earn'>('store')
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [detailItem, setDetailItem] = useState<RewardItem | null>(null)
  const [orderDone, setOrderDone] = useState<string[] | null>(null)
  const [treeAnim, setTreeAnim] = useState(false)
  const [treeStage, setTreeStage] = useState<'growing' | 'cert' | 'done'>('growing')
  const storeUser = useUser()
  const [pts, setPts] = useState(USER_POINTS)
  // Sync with store
  useEffect(() => { setPts(storeUser.points) }, [storeUser.points])

  const currentTier = getTier(pts)
  const nextTier = getNextTier(pts)
  const tierProgress = nextTier
    ? ((pts - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100

  const filtered = useMemo(() => ITEMS.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory
    const matchSearch = !search || item.name.includes(search) || item.desc.includes(search)
    return matchCat && matchSearch
  }), [activeCategory, search])

  const cartTotal = cart.reduce((s, i) => s + i.points * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  function addToCart(item: RewardItem) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c))
  }

  function checkout() {
    if (pts < cartTotal) return
    const names = cart.map(c => c.name)
    const hasTree = cart.some(c => TREE_IDS.has(c.id))
    setPts(p => p - cartTotal)
    setCart([])
    setShowCart(false)
    if (hasTree) {
      setTreeStage('growing')
      setTreeAnim(true)
      setTimeout(() => setTreeStage('cert'), 2000)
      setTimeout(() => setTreeStage('done'), 3500)
    } else {
      setOrderDone(names)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-4 pt-6 pb-14">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              <h1 className="text-lg font-bold">Echo 點數</h1>
            </div>
            {activeTab === 'store' && (
              <button onClick={() => setShowCart(true)} className="relative bg-white/20 hover:bg-white/30 rounded-xl px-3 py-1.5 flex items-center gap-2 transition-colors">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-medium">購物車</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </button>
            )}
          </div>

          <div className="bg-white/15 backdrop-blur rounded-2xl p-4">
            <p className="text-white/70 text-xs mb-0.5">目前點數</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-bold">{pts.toLocaleString()}</span>
              <span className="text-white/70 mb-0.5 text-sm">點</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span>{currentTier.icon}</span>
              <span className="text-sm font-semibold">{currentTier.name} 會員</span>
              {nextTier && <span className="text-white/60 text-xs ml-auto">距 {nextTier.name} 還差 {(nextTier.min - pts).toLocaleString()} 點</span>}
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(tierProgress, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 -mt-6">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl shadow-sm mb-4 p-1">
          {[
            { key: 'store', label: '兌換商城', icon: <Gift className="h-4 w-4" /> },
            { key: 'history', label: '點數紀錄', icon: <History className="h-4 w-4" /> },
            { key: 'earn', label: '如何獲點', icon: <Zap className="h-4 w-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-emerald-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ── Store Tab ── */}
        {activeTab === 'store' && (
          <div className="pb-8">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜尋商品..."
                className="pl-9 bg-white border-gray-200"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.icon}</span>{cat.label}
                </button>
              ))}
            </div>

            {/* 票券折扣換算說明 */}
            {(activeCategory === 'discount' || activeCategory === 'all') && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3">
                <span className="text-lg">⭐</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-800">票券折扣換算比例</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">每 <strong>10 點</strong> 折抵 <strong>NT$1</strong>｜可於結帳時直接折抵，無到期日</p>
                </div>
                <div className="shrink-0 bg-amber-400 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                  10pt = 1元
                </div>
              </div>
            )}

            {/* Count */}
            <p className="text-xs text-gray-400 mb-3">{filtered.length} 件商品</p>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">找不到符合商品</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map(item => (
                  <ItemCard key={item.id} item={item} pts={pts} onAdd={() => addToCart(item)} onDetail={() => setDetailItem(item)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── History Tab ── */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">交易紀錄</span>
              <span className="text-xs text-gray-400">最近 {HISTORY.length} 筆</span>
            </div>
            {HISTORY.map((h, i) => (
              <div key={h.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < HISTORY.length - 1 ? 'border-b' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
                  h.type === 'earn' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  {h.type === 'earn' ? '' : ''}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{h.desc}</p>
                  <p className="text-xs text-gray-400">{h.date}</p>
                </div>
                <span className={`font-bold text-sm shrink-0 ${h.type === 'earn' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {h.points > 0 ? `+${h.points}` : h.points}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Earn Tab ── */}
        {activeTab === 'earn' && (
          <div className="pb-8 space-y-3">
            <div className="bg-emerald-50 rounded-2xl p-4">
              <p className="text-sm font-semibold text-emerald-800 mb-1">累積 Echo 點數</p>
              <p className="text-xs text-emerald-600">消費即可獲點，解鎖各式好禮與特權體驗</p>
            </div>
            {EARN_WAYS.map((w, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm flex items-center gap-3 px-4 py-3.5">
                <span className="text-2xl">{w.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{w.text}</p>
                  <p className="text-xs text-gray-400">{w.sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Cart Drawer ── */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={() => setShowCart(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-5 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">兌換清單</h3>
              <button onClick={() => setShowCart(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400">
                <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">購物車是空的</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.bg} flex items-center justify-center text-2xl shrink-0`}>
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-600">{(item.points * item.qty).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Plus className="h-3 w-3" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-500">合計點數</span>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-emerald-600" />
                      <span className="text-lg font-bold text-emerald-600">{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-400">兌換後餘額</span>
                    <span className={`text-sm font-semibold ${pts - cartTotal < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                      {(pts - cartTotal).toLocaleString()} 點
                    </span>
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-semibold"
                    disabled={pts < cartTotal}
                    onClick={checkout}
                  >
                    {pts < cartTotal ? '點數不足' : `確認兌換 ${cart.length} 件`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Item Detail Sheet ── */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={() => setDetailItem(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className={`h-40 bg-gradient-to-br ${detailItem.bg} flex items-center justify-center relative shrink-0 overflow-hidden`}>
              {detailItem.image && (
                <img src={detailItem.image} alt={detailItem.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <span className="text-6xl relative z-10 drop-shadow-xl">{detailItem.emoji}</span>
              <button onClick={() => setDetailItem(null)} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 rounded-full p-1.5 z-10">
                <X className="h-4 w-4 text-white" />
              </button>
              <div className="absolute top-4 left-4 flex gap-1.5">
                {detailItem.popular && <Badge className="bg-red-500 text-white text-xs">熱門</Badge>}
                {detailItem.limited && <Badge className="bg-amber-500 text-white text-xs">限量</Badge>}
                {detailItem.new && <Badge className="bg-blue-500 text-white text-xs">新品</Badge>}
              </div>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{detailItem.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{detailItem.desc}</p>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Coins className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="font-bold text-emerald-600">{detailItem.points.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">所需點數</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <span className="font-bold text-gray-700 block">{detailItem.stock}</span>
                  <p className="text-[10px] text-gray-400">剩餘庫存</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <span className="font-bold text-gray-700 block">{pts.toLocaleString()}</span>
                  <p className="text-[10px] text-gray-400">我的點數</p>
                </div>
              </div>

              {pts < detailItem.points && (
                <div className="bg-red-50 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">點數不足，還差 {(detailItem.points - pts).toLocaleString()} 點</p>
                </div>
              )}
            </div>
            <div className="px-5 pb-5 shrink-0">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDetailItem(null)}>關閉</Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={pts < detailItem.points}
                  onClick={() => { addToCart(detailItem); setDetailItem(null) }}
                >
                  <Plus className="h-4 w-4 mr-1" />加入兌換
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Elf Forest Animation ── */}
      {treeAnim && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          style={{ background: 'linear-gradient(180deg,#020d02 0%,#061a06 35%,#0a2a0a 65%,#041004 100%)' }}
        >
          {/* Stars */}
          {[...Array(24)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{
              width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`,
              left: `${(i * 4.17) % 100}%`, top: `${(i * 3.73) % 42}%`,
              animation: `elf-twinkle ${1.5 + (i % 4) * 0.5}s ease-in-out ${(i * 0.27) % 3}s infinite`,
            }} />
          ))}

          {/* Moon */}
          <div className="absolute" style={{ width: 44, height: 44, top: 28, right: 40, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#fffce0,#f0ce60)', boxShadow: '0 0 20px 6px rgba(240,200,80,0.22)' }} />

          {/* Fireflies */}
          {[...Array(7)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: 4, height: 4, background: '#7fff7f',
              left: `${12 + (i * 12.7) % 76}%`, top: `${38 + (i * 8.3) % 35}%`,
              boxShadow: '0 0 8px 3px rgba(100,255,100,0.7)',
              animation: `elf-firefly ${2.5 + (i % 3) * 0.8}s ease-in-out ${(i * 0.7) % 3}s infinite`,
            }} />
          ))}

          {/* Back trees */}
          <svg className="absolute bottom-0 left-0 w-full" style={{ height: '45%' }} viewBox="0 0 400 200" preserveAspectRatio="none">
            {[15,55,95,135,175,215,255,295,335,375].map((x, i) => (
              <g key={i} opacity="0.2">
                <polygon points={`${x},200 ${x-13},90 ${x+13},90`} fill="#1a5c1a" />
                <polygon points={`${x},105 ${x-9},20 ${x+9},20`} fill="#1a5c1a" />
              </g>
            ))}
          </svg>

          {/* Mid trees */}
          <svg className="absolute bottom-0 left-0 w-full" style={{ height: '58%' }} viewBox="0 0 400 240" preserveAspectRatio="none">
            {[0,50,100,150,200,250,300,350,400].map((x, i) => (
              <g key={i} opacity="0.45">
                <polygon points={`${x},240 ${x-17},100 ${x+17},100`} fill="#0a3b0a" />
                <polygon points={`${x},115 ${x-12},20 ${x+12},20`} fill="#0a3b0a" />
                <rect x={x-4} y="235" width="8" height="8" fill="#060f06" />
              </g>
            ))}
          </svg>

          {/* Front trees */}
          <svg className="absolute bottom-0 left-0 w-full" style={{ height: '68%' }} viewBox="0 0 400 300" preserveAspectRatio="none">
            {[-15,90,210,325,420].map((x, i) => (
              <g key={i}>
                <polygon points={`${x},300 ${x-26},95 ${x+26},95`} fill="#030b03" />
                <polygon points={`${x},115 ${x-18},5 ${x+18},5`} fill="#030b03" />
              </g>
            ))}
          </svg>

          {/* Ground glow / mist */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: '28%', background: 'linear-gradient(to top,rgba(10,80,10,0.38),transparent)', animation: 'elf-mist 5s ease-in-out infinite' }} />

          {/* ── ELF + ENVELOPE ── */}
          <div className="absolute" style={{ left: '50%', top: '10%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>

            {/* Envelope — appears when cert/done */}
            <div style={{
              marginBottom: 4,
              marginLeft: 36,
              opacity: treeStage !== 'growing' ? 1 : 0,
              transform: treeStage !== 'growing' ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.7)',
              transition: 'all 0.9s ease-out 0.2s',
              animation: treeStage === 'done' ? 'elf-envelope-float 2.5s ease-in-out infinite' : 'none',
            }}>
              <svg width="70" height="52" viewBox="0 0 70 52">
                <ellipse cx="35" cy="26" rx="36" ry="28" fill="rgba(255,215,50,0.12)" />
                <rect x="2" y="12" width="66" height="38" rx="4" fill="#f5e89a" stroke="#c8a830" strokeWidth="1.5" />
                <path d="M2,12 L35,32 L68,12 Z" fill="#e8d058" stroke="#c8a830" strokeWidth="1.5" />
                <path d="M2,50 L25,32" stroke="#c8a830" strokeWidth="1" opacity="0.35" />
                <path d="M68,50 L45,32" stroke="#c8a830" strokeWidth="1" opacity="0.35" />
                <circle cx="35" cy="44" r="7" fill="#9e1e0a" />
                <text x="31.5" y="48.5" fontSize="9" fill="#ffd0c0">🌿</text>
                <circle cx="61" cy="8" r="2" fill="#ffd700" opacity="0.8" />
                <circle cx="9" cy="9" r="1.5" fill="#ffd700" opacity="0.65" />
              </svg>
            </div>

            {/* Elf outer: slide-in from left */}
            <div style={{
              animation: treeStage === 'growing' ? 'elf-enter 1.8s cubic-bezier(0.22,0.61,0.36,1) forwards' : 'none',
              transform: treeStage !== 'growing' ? 'translateX(0)' : undefined,
            }}>
              {/* Elf inner: bob/idle */}
              <div style={{ animation: treeStage === 'growing' ? 'elf-walk 0.45s ease-in-out infinite' : 'elf-idle 3.5s ease-in-out infinite' }}>
                <svg width="108" height="182" viewBox="0 0 108 182">
                  {/* Shadow */}
                  <ellipse cx="54" cy="178" rx="26" ry="5" fill="rgba(0,0,0,0.3)" />
                  {/* Dress skirt */}
                  <path d="M24,92 Q10,140 7,176 L101,176 Q98,140 84,92 Z" fill="#1b6e30" />
                  <path d="M30,115 Q54,148 78,115 Q63,158 54,176 Q45,158 30,115 Z" fill="#135224" opacity="0.5" />
                  {/* Belt */}
                  <rect x="25" y="87" width="58" height="8" rx="4" fill="#7a3308" />
                  <rect x="46" y="85" width="16" height="12" rx="3" fill="#c89020" />
                  {/* Torso */}
                  <path d="M27,64 Q25,87 24,92 L84,92 Q83,87 81,64 Z" fill="#228c38" />
                  {/* Neck */}
                  <rect x="44" y="54" width="20" height="14" rx="5" fill="#ffc59f" />
                  {/* Head */}
                  <ellipse cx="54" cy="38" rx="23" ry="25" fill="#ffc59f" />
                  {/* Left pointy ear */}
                  <path d="M31,39 C21,35 15,26 21,21 C26,28 31,33 33,39 Z" fill="#ffc59f" />
                  <path d="M31,39 C24,35 21,28 25,24" stroke="#e0986e" strokeWidth="0.8" fill="none" />
                  {/* Right pointy ear */}
                  <path d="M77,39 C87,35 93,26 87,21 C82,28 77,33 75,39 Z" fill="#ffc59f" />
                  <path d="M77,39 C84,35 87,28 83,24" stroke="#e0986e" strokeWidth="0.8" fill="none" />
                  {/* Hair */}
                  <ellipse cx="54" cy="24" rx="25" ry="16" fill="#7a2e0a" />
                  <path d="M31,36 Q14,72 16,124" stroke="#7a2e0a" strokeWidth="9" fill="none" strokeLinecap="round" />
                  <path d="M77,36 Q94,72 92,124" stroke="#7a2e0a" strokeWidth="9" fill="none" strokeLinecap="round" />
                  {/* Hat */}
                  <polygon points="54,1 34,35 74,35" fill="#156b1a" />
                  <ellipse cx="54" cy="35" rx="22" ry="6" fill="#1a8820" />
                  <rect x="32" y="32" width="44" height="5" fill="#0d5c10" />
                  {/* Hat gem */}
                  <circle cx="54" cy="16" r="5" fill="#ffd700" opacity="0.85" />
                  <polygon points="54,11 55.8,15.8 61,15.8 56.9,18.7 58.5,23.5 54,20.5 49.5,23.5 51.1,18.7 47,15.8 52.2,15.8" fill="rgba(255,255,200,0.75)" />
                  {/* Eyes */}
                  <ellipse cx="42" cy="37" rx="6" ry="7" fill="white" />
                  <ellipse cx="66" cy="37" rx="6" ry="7" fill="white" />
                  <ellipse cx="43" cy="38" rx="4" ry="5" fill="#1a6b2a" />
                  <ellipse cx="67" cy="38" rx="4" ry="5" fill="#1a6b2a" />
                  <circle cx="44.5" cy="36.5" r="1.5" fill="white" />
                  <circle cx="68.5" cy="36.5" r="1.5" fill="white" />
                  {/* Eyebrows */}
                  <path d="M36,28 Q42,25 48,28" stroke="#5c1e06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <path d="M60,28 Q66,25 72,28" stroke="#5c1e06" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  {/* Nose */}
                  <ellipse cx="54" cy="46" rx="3" ry="2.2" fill="#e0986e" />
                  {/* Smile */}
                  <path d="M46,55 Q54,62 62,55" stroke="#c07040" strokeWidth="2" fill="none" strokeLinecap="round" />
                  {/* Left arm */}
                  <path d="M27,75 Q6,102 3,126" stroke="#ffc59f" strokeWidth="9" fill="none" strokeLinecap="round" />
                  <ellipse cx="3" cy="129" rx="7" ry="7" fill="#ffc59f" />
                  {/* Right arm — raised, offering envelope */}
                  <path d="M81,73 Q100,54 106,38" stroke="#ffc59f" strokeWidth="9" fill="none" strokeLinecap="round" />
                  <ellipse cx="107" cy="36" rx="7" ry="7" fill="#ffc59f" />
                  {/* Hem sparkles */}
                  <circle cx="11" cy="174" r="1.8" fill="#80ff80" opacity="0.55" />
                  <circle cx="97" cy="172" r="1.8" fill="#80ff80" opacity="0.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Status text */}
          {treeStage === 'growing' && (
            <div className="absolute text-center px-6" style={{ bottom: 52, left: 0, right: 0, zIndex: 10 }}>
              <p className="text-emerald-300 text-sm font-medium" style={{ animation: 'elf-pulse 1.5s ease-in-out infinite' }}>
                神秘精靈正在靠近...
              </p>
            </div>
          )}
          {treeStage === 'cert' && (
            <div className="absolute text-center px-6" style={{ bottom: 52, left: 0, right: 0, zIndex: 10 }}>
              <p className="text-yellow-200 text-sm font-semibold" style={{ animation: 'elf-fade-in 0.6s ease-out' }}>
                ✨ 精靈獻上你的樹憑證...
              </p>
            </div>
          )}

          {/* Certificate card — slides up when done */}
          {treeStage === 'done' && (
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-6" style={{ animation: 'elf-slide-up 0.6s ease-out', zIndex: 20 }}>
              <div className="bg-white rounded-3xl p-5 max-w-sm mx-auto shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-xl shrink-0">🌲</div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-600 tracking-widest">ECHO TREE · 官方認證</div>
                    <div className="text-base font-black text-gray-900">植樹認養憑證</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  本憑證由回音樹 ESG 計畫核發，已列入回音森林名人堂。感謝你為地球種下希望 🌱
                </p>
                <a
                  href={ANYDEEE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center font-bold py-3 rounded-2xl text-sm mb-2"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#14b8a6)', color: 'white', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}
                  onClick={() => setTreeAnim(false)}
                >
                  🌿 前往 ANYDEEE 查看憑證
                </a>
                <button onClick={() => setTreeAnim(false)} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1.5">
                  稍後再看
                </button>
              </div>
            </div>
          )}

          <style>{`
            @keyframes elf-twinkle {
              0%,100%{opacity:0.2;transform:scale(0.7);}
              50%{opacity:1;transform:scale(1.3);}
            }
            @keyframes elf-firefly {
              0%,100%{opacity:0.1;transform:translate(0,0);}
              30%{opacity:0.9;transform:translate(12px,-18px);}
              70%{opacity:0.5;transform:translate(-8px,-10px);}
            }
            @keyframes elf-enter {
              from{transform:translateX(-105vw);}
              to{transform:translateX(0);}
            }
            @keyframes elf-walk {
              0%,100%{transform:translateY(0) rotate(-0.5deg);}
              50%{transform:translateY(-6px) rotate(0.5deg);}
            }
            @keyframes elf-idle {
              0%,100%{transform:translateY(0) rotate(-1deg);}
              50%{transform:translateY(-5px) rotate(1deg);}
            }
            @keyframes elf-envelope-float {
              0%,100%{transform:translateY(0) rotate(-4deg);}
              50%{transform:translateY(-10px) rotate(4deg);}
            }
            @keyframes elf-mist {
              0%,100%{opacity:0.7;}
              50%{opacity:1;}
            }
            @keyframes elf-pulse {
              0%,100%{opacity:0.6;}
              50%{opacity:1;}
            }
            @keyframes elf-fade-in {
              from{opacity:0;transform:translateY(8px);}
              to{opacity:1;transform:translateY(0);}
            }
            @keyframes elf-slide-up {
              from{opacity:0;transform:translateY(70px);}
              to{opacity:1;transform:translateY(0);}
            }
          `}</style>
        </div>
      )}

      {/* ── Order Success ── */}
      {orderDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">兌換成功！</h3>
            <p className="text-sm text-gray-500 mb-4">以下商品已加入你的帳戶</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-5 text-left space-y-1.5">
              {orderDone.map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {name}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1 mb-5">
              <Coins className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-500">剩餘點數：</span>
              <span className="font-bold text-emerald-600">{pts.toLocaleString()} 點</span>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setOrderDone(null)}>
              繼續逛商城
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
