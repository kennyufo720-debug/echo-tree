'use client'
import { useState, useEffect } from 'react'
import { User, Star, ShoppingBag, Ticket, TreePine, ChevronRight, Crown, Shield, Music } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUser, getStoredOrders } from '@/lib/store'

// ── Store orders (from /store page) ───────────────────────
interface StoreOrder {
  id: string
  itemId: string
  name: string
  image: string
  points: number
  at: string
}

const STORE_ORDERS_KEY = 'echotree_store_orders'

function loadStoreOrders(): StoreOrder[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORE_ORDERS_KEY) ?? '[]') } catch { return [] }
}

// ── Tier system ───────────────────────────────────────────
const TIERS = [
  { name: '音符',  min: 0,     max: 999,      color: 'text-gray-500',   bg: 'bg-gray-100',   icon: <Music className="h-4 w-4" /> },
  { name: '旋律',  min: 1000,  max: 2999,     color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Star className="h-4 w-4" /> },
  { name: '和弦',  min: 3000,  max: 5999,     color: 'text-blue-600',   bg: 'bg-blue-50',    icon: <Shield className="h-4 w-4" /> },
  { name: '交響',  min: 6000,  max: 9999,     color: 'text-violet-600', bg: 'bg-violet-50',  icon: <Crown className="h-4 w-4" /> },
  { name: '傳奇',  min: 10000, max: Infinity, color: 'text-amber-600',  bg: 'bg-amber-50',   icon: <Crown className="h-4 w-4 fill-amber-500" /> },
]

function getTier(pts: number) {
  return TIERS.find(t => pts >= t.min && pts <= t.max) ?? TIERS[0]
}

// ── Component ──────────────────────────────────────────────
export default function MemberPage() {
  const user = useUser()
  const ticketOrders = getStoredOrders()
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([])

  useEffect(() => {
    setStoreOrders(loadStoreOrders())
    const handler = () => setStoreOrders(loadStoreOrders())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const tier = getTier(user.points)
  const nextTier = TIERS[TIERS.indexOf(tier) + 1]
  const progress = nextTier
    ? Math.round(((user.points - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero / Profile */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-800 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-3xl">
              🌿
            </div>
            <div>
              <div className="text-xl font-black">
                {user.verified ? `+886 ${user.phone.slice(-4) ? '****' + user.phone.slice(-4) : '已驗證'}` : '訪客'}
              </div>
              <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${tier.bg} ${tier.color}`}>
                {tier.icon}<span>{tier.name}會員</span>
              </div>
            </div>
            {!user.verified && (
              <Link href="/verify" className="ml-auto">
                <Button size="sm" className="bg-white text-emerald-800 hover:bg-white/90 font-bold">立即驗證</Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: '可用點數', value: user.points.toLocaleString(), unit: 'pts' },
              { label: '票券訂單', value: ticketOrders.length, unit: '張' },
              { label: '商城兌換', value: storeOrders.length, unit: '件' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center border border-white/10">
                <div className="text-2xl font-black text-emerald-300">{s.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tier progress */}
          <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
            <div className="flex justify-between text-xs text-white/60 mb-1.5">
              <span>{tier.name} · {user.points.toLocaleString()} pts</span>
              <span>{nextTier ? `下一級：${nextTier.name} (${nextTier.min.toLocaleString()} pts)` : '頂級會員 🎉'}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/store',   icon: <ShoppingBag className="h-5 w-5" />, label: '限量商城',   color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100' },
            { href: '/tickets', icon: <Ticket className="h-5 w-5" />,      label: '我的票券',   color: 'text-blue-600',    bg: 'bg-blue-50 hover:bg-blue-100' },
            { href: '/points',  icon: <Star className="h-5 w-5" />,        label: '點數兌換',   color: 'text-violet-600',  bg: 'bg-violet-50 hover:bg-violet-100' },
            { href: '/forest',  icon: <TreePine className="h-5 w-5" />,    label: '回音森林',   color: 'text-teal-600',    bg: 'bg-teal-50 hover:bg-teal-100' },
          ].map(a => (
            <Link key={a.href} href={a.href}>
              <div className={`${a.bg} ${a.color} rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-current/20`}>
                {a.icon}
                <span className="text-xs font-bold">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Store order history */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-600" /> 限量商城兌換紀錄
            </h2>
            <Link href="/store" className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
              前往商城 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {storeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
              <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">尚無兌換紀錄</p>
              <Link href="/store">
                <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white">去逛商城</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {storeOrders.slice(0, 10).map(o => (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={o.image} alt={o.name} className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{o.name}</div>
                    <div className="text-xs text-gray-400">{o.at}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-emerald-600 font-black text-sm">-{o.points.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400">點數</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket order history */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-gray-900 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-600" /> 票券購買紀錄
            </h2>
            <Link href="/tickets" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
              我的票券 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {ticketOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
              <Ticket className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">尚無購票紀錄</p>
              <Link href="/events">
                <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">瀏覽活動</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {ticketOrders.slice(0, 5).map(o => (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Ticket className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{o.eventTitle}</div>
                    <div className="text-xs text-gray-400">{o.eventDate} · {o.seats.length} 張</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-blue-600 font-black text-sm">NT${o.totalAmount.toLocaleString()}</div>
                    <Badge variant="outline" className="text-[10px] mt-0.5">
                      {o.status === 'paid' ? '✅ 已付款' : o.status === 'pending' ? '⏳ 待付款' : '❌ 已取消'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
