'use client'
import { useState, useEffect } from 'react'
import { User, Star, ShoppingBag, Ticket, TreePine, ChevronRight, Crown, Shield, Music, MessageCircle, CheckCheck, Send, Mail, Bell, Check, Pencil } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUser, useOrders, setUser } from '@/lib/store'
import { useConversations, useUnreadCount } from '@/lib/messages'

// ── Store orders ── BUG-05 fix: match actual shape written by store/page.tsx
interface StoreOrder {
  id: string
  items: { name: string; image: string; qty: number; price: number }[]
  subtotal: number
  discount: number
  total: number
  pointsUsed: number
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

// ── 私訊預覽卡 ───────────────────────────────────────────
function MsgPreviewCard({ conv, unread }: {
  conv: ReturnType<typeof useConversations>[0]
  unread: number
}) {
  const last = conv.messages[conv.messages.length - 1]
  const fromMe = last?.senderId === 'me'
  return (
    <Link href={`/messages/${conv.id}`}>
      <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors cursor-pointer
        ${unread > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
        {/* 頭像 */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-xl">
            {conv.contactAvatar}
          </div>
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
        {/* 內容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
              {conv.contactName}
            </span>
            <span className="text-[10px] text-gray-400 shrink-0 ml-2">
              {last?.createdAt?.split(' ')[0] ?? ''}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {fromMe && <CheckCheck className="h-3 w-3 text-emerald-500 shrink-0" />}
            <p className={`text-xs truncate ${unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
              {fromMe ? '你：' : ''}{last?.body ?? '尚無訊息'}
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
      </div>
    </Link>
  )
}

// ── Component ──────────────────────────────────────────────
type Tab = 'overview' | 'messages' | 'orders'

export default function MemberPage() {
  const user = useUser()
  const ticketOrders = useOrders()
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const conversations = useConversations()
  const unreadCount = useUnreadCount()

  // ── Email notification state ──────────────────────────
  const [emailEdit, setEmailEdit] = useState(false)
  const [emailInput, setEmailInput] = useState(user.email ?? '')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailSaved, setEmailSaved] = useState(false)

  // Keep input in sync when user loads
  useEffect(() => { setEmailInput(user.email ?? '') }, [user.email])

  async function saveEmail() {
    if (!user.phone) return
    setEmailSaving(true)
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, email: emailInput.trim() || null }),
      })
      setUser({ email: emailInput.trim() })
      setEmailSaved(true)
      setEmailEdit(false)
      setTimeout(() => setEmailSaved(false), 3000)
    } finally {
      setEmailSaving(false)
    }
  }

  useEffect(() => {
    // Try API first; fall back to localStorage
    if (user.phone) {
      fetch(`/api/store/orders?phone=${encodeURIComponent(user.phone)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setStoreOrders(data.map((d: any) => ({
              id: d.id,
              items: [{ name: d.name, image: d.image ?? '', qty: 1, price: d.points }],
              subtotal: d.points,
              discount: 0,
              total: d.points,
              pointsUsed: 0,
              at: d.created_at?.slice(0, 10) ?? '',
            })))
          } else {
            setStoreOrders(loadStoreOrders())
          }
        })
        .catch(() => setStoreOrders(loadStoreOrders()))
    } else {
      setStoreOrders(loadStoreOrders())
      const handler = () => setStoreOrders(loadStoreOrders())
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    }
  }, [user.phone])

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
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: '可用點數',  value: user.points.toLocaleString(), unit: 'pts' },
              { label: '票券訂單',  value: ticketOrders.length,          unit: '張'  },
              { label: '商城兌換',  value: storeOrders.length,           unit: '件'  },
              { label: '未讀私訊',  value: unreadCount,                  unit: '則'  },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center border border-white/10">
                <div className="text-xl font-black text-emerald-300">{s.value}</div>
                <div className="text-[10px] text-white/60 mt-0.5">{s.label}</div>
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

        {/* Tab 切換 */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1">
          {([
            { key: 'overview',  label: '總覽',   icon: <User className="h-4 w-4" /> },
            { key: 'messages',  label: '私訊',   icon: <MessageCircle className="h-4 w-4" />, badge: unreadCount },
            { key: 'orders',    label: '訂單',   icon: <ShoppingBag className="h-4 w-4" /> },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-colors relative
                ${tab === t.key ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.icon}
              {t.label}
              {'badge' in t && t.badge > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {t.badge > 9 ? '9+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── 總覽 Tab ── */}
        {tab === 'overview' && (
          <>
            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: '/store',    icon: <ShoppingBag className="h-5 w-5" />, label: '限量商城', color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100' },
                { href: '/tickets',  icon: <Ticket className="h-5 w-5" />,      label: '我的票券', color: 'text-blue-600',    bg: 'bg-blue-50 hover:bg-blue-100' },
                { href: '/points',   icon: <Star className="h-5 w-5" />,        label: '點數兌換', color: 'text-violet-600',  bg: 'bg-violet-50 hover:bg-violet-100' },
                { href: '/forest',   icon: <TreePine className="h-5 w-5" />,    label: '回音森林', color: 'text-teal-600',    bg: 'bg-teal-50 hover:bg-teal-100' },
              ].map(a => (
                <Link key={a.href} href={a.href}>
                  <div className={`${a.bg} ${a.color} rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-current/20`}>
                    {a.icon}
                    <span className="text-xs font-bold">{a.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* 通知設定 — Email */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-gray-900 flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-emerald-600" /> 通知設定
                </h2>
                {emailSaved && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />已儲存
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">通知 Email</p>
                  {emailEdit ? (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 text-sm border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-300 min-w-0"
                      />
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 h-7 text-xs shrink-0"
                        onClick={saveEmail} disabled={emailSaving}>
                        {emailSaving ? '...' : '儲存'}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs shrink-0"
                        onClick={() => { setEmailEdit(false); setEmailInput(user.email ?? '') }}>
                        取消
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 truncate">
                        {user.email || <span className="text-gray-400 italic">尚未設定</span>}
                      </span>
                      <button onClick={() => setEmailEdit(true)} className="shrink-0 text-gray-400 hover:text-emerald-600 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                票券超過 7 天未兌換樹憑證時，系統將透過平台私訊與此 Email 提醒您。
              </p>
            </div>

            {/* 最新私訊預覽 */}
            {conversations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-emerald-600" /> 最新私訊
                    {unreadCount > 0 && (
                      <span className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </h2>
                  <button onClick={() => setTab('messages')} className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
                    全部訊息 <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {conversations.slice(0, 3).map(conv => {
                    const unread = conv.messages.filter(m => !m.read && m.senderId !== 'me').length
                    return <MsgPreviewCard key={conv.id} conv={conv} unread={unread} />
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── 私訊 Tab ── */}
        {tab === 'messages' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-gray-900 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-600" /> 私訊訊息夾
              </h2>
              <Link href="/messages">
                <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200">
                  <Send className="h-3 w-3 mr-1" /> 新增對話
                </Button>
              </Link>
            </div>

            {conversations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-semibold">尚無私訊</p>
                <p className="text-xs mt-1 text-gray-300">在演唱會或論壇頁面開始對話吧</p>
                <Link href="/messages">
                  <Button size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">前往私訊</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(conv => {
                  const unread = conv.messages.filter(m => !m.read && m.senderId !== 'me').length
                  return <MsgPreviewCard key={conv.id} conv={conv} unread={unread} />
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 訂單 Tab ── */}
        {tab === 'orders' && (
          <div className="space-y-6">
            {/* Store orders */}
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
                  {storeOrders.slice(0, 10).map(o => {
                    const firstItem = o.items?.[0]
                    return (
                      <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {firstItem?.image && (
                            <img src={firstItem.image} alt={firstItem.name} className="w-full h-full object-cover"
                              onError={e => { e.currentTarget.style.display = 'none' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 truncate">
                            {o.items?.map(i => i.name).join('、') ?? '商城訂單'}
                          </div>
                          <div className="text-xs text-gray-400">{o.at}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-emerald-600 font-black text-sm">NT${o.total?.toLocaleString() ?? 0}</div>
                          <div className="text-[10px] text-gray-400">台幣</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Ticket orders */}
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
        )}

      </div>
    </div>
  )
}
