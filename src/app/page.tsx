'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Search, MapPin, Calendar, ChevronRight, Flame, Clock, Tag, MessageSquare, ShoppingBag, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Event } from '@/lib/types'

const categories = [
  { id: 'all', label: '全部' },
  { id: 'concert', label: '演唱會' },
  { id: 'festival', label: '音樂節' },
  { id: 'theater', label: '戲劇' },
  { id: 'sports', label: '運動' },
]

const cities = ['全部城市', '台北', '台中', '高雄', '桃園', '台南']

function EventCard({ event }: { event: Event }) {
  const availabilityPct = (event.availableSeats / event.totalSeats) * 100

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 shadow-sm">
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {event.tags.map(tag => (
              <Badge
                key={tag}
                className={`text-xs font-medium ${
                  tag === '熱門' || tag === '快售完'
                    ? 'bg-red-500 text-white'
                    : tag === '即將開賣'
                    ? 'bg-blue-500 text-white'
                    : tag === '已售完'
                    ? 'bg-gray-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-sm font-medium opacity-90">{event.artist}</p>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{event.date} {event.time}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="h-3.5 w-3.5" />
            <span>{event.venue}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">票價</p>
              <p className="font-bold text-emerald-600">
                NT$ {event.priceFrom.toLocaleString()}
                <span className="text-xs font-normal text-gray-400"> 起</span>
              </p>
            </div>
            {event.status === 'sold-out' ? (
              <Badge variant="secondary" className="text-gray-500">已售完</Badge>
            ) : event.status === 'coming-soon' ? (
              <Badge className="bg-blue-50 text-blue-600 border border-blue-200">即將開賣</Badge>
            ) : availabilityPct < 20 ? (
              <Badge className="bg-red-50 text-red-600 border border-red-200">快售完</Badge>
            ) : (
              <Badge className="bg-green-50 text-green-600 border border-green-200">購票中</Badge>
            )}
          </div>

          {event.status === 'on-sale' && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>剩餘座位</span>
                <span>{event.availableSeats.toLocaleString()} / {event.totalSeats.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    availabilityPct < 20 ? 'bg-red-400' : availabilityPct < 50 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${availabilityPct}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

interface StoreItem { id: string; name: string; image: string; points: number; tag: string; tagColor: string; stock: number; total?: number }

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCity, setSelectedCity] = useState('全部城市')
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [heroIdx, setHeroIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const featuredEvents = events.filter(e => e.status === 'on-sale').slice(0, 5)
  const total = featuredEvents.length || 1
  const next = useCallback(() => setHeroIdx(i => (i + 1) % total), [total])
  const prev = useCallback(() => setHeroIdx(i => (i - 1 + total) % total), [total])

  // Fetch events from API
  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents).catch(() => {})
  }, [])

  // Fetch store items from API
  useEffect(() => {
    fetch('/api/store')
      .then(r => r.json())
      .then((data: Array<{ id: string; name: string; image: string; points: number; stock: number; is_new?: boolean; limited?: boolean; popular?: boolean }>) => {
        setStoreItems(data.map(d => ({
          id: d.id, name: d.name, image: d.image ?? '', points: d.points, stock: d.stock,
          tag: d.popular ? '熱門' : d.limited ? '限量' : d.is_new ? '新品' : '精選',
          tagColor: d.popular ? '#f97316' : d.limited ? '#ec4899' : d.is_new ? '#8b5cf6' : '#10b981',
        })))
      })
      .catch(() => {})
  }, [])

  // Auto-play carousel
  useEffect(() => {
    timerRef.current = setTimeout(next, 4500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [heroIdx, next])

  const filtered = events.filter(e => {
    const matchCategory = selectedCategory === 'all' || e.category === selectedCategory
    const matchCity = selectedCity === '全部城市' || e.city === selectedCity
    const matchSearch = !search || e.title.includes(search) || e.artist.includes(search)
    return matchCategory && matchCity && matchSearch
  })


  return (
    <div>
      {/* Hero Carousel */}
      <section
        className="relative h-[480px] overflow-hidden select-none"
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return
          const diff = touchStartX.current - e.changedTouches[0].clientX
          if (Math.abs(diff) > 40) { if (timerRef.current) clearTimeout(timerRef.current); diff > 0 ? next() : prev() }
          touchStartX.current = null
        }}
      >
        {featuredEvents.map((ev, idx) => (
          <div
            key={ev.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === heroIdx ? 1 : 0, zIndex: idx === heroIdx ? 10 : 0 }}
          >
            <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" style={{ objectPosition: ev.imagePosition ?? 'center' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-lg">
                  <Badge className="bg-emerald-600 text-white mb-3">精選活動</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-snug">{ev.title}</h1>
                  <p className="text-emerald-200 text-base mb-2">{ev.artist}</p>
                  <div className="flex gap-4 text-white/80 text-sm mb-6">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{ev.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{ev.venue}</span>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/events/${ev.id}`}>
                      <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        立即購票 <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                    <Link href={`/events/${ev.id}`}>
                      <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 bg-transparent">
                        了解更多
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Prev / Next arrows (hidden on mobile) */}
        <button onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); prev() }}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 items-center justify-center text-white transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); next() }}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 items-center justify-center text-white transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {featuredEvents.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); setHeroIdx(i) }}
              className={`h-2 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* 藝人周邊 + 限量商城 */}
      <section className="bg-white border-b overflow-hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"> 藝人周邊</span>
            <span className="text-xs font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full">🌲 限量商城</span>
            <span className="text-xs text-gray-400 hidden sm:inline">· 點數折抵 10%</span>
            <Link href="/store" className="ml-auto text-[11px] text-emerald-600 font-medium hover:underline flex items-center gap-0.5">
              全部 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {storeItems.filter(i => i.stock > 0).map(item => (
              <Link key={item.id} href="/store" className="shrink-0 w-36 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-gray-100 group">
                <div className="h-28 overflow-hidden bg-gray-100 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.currentTarget.style.display = 'none' }} />
                  <span className="absolute top-1.5 left-1.5 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm" style={{ background: item.tagColor }}>
                    {item.tag}
                  </span>
                </div>
                <div className="p-2.5 bg-white">
                  <p className="text-[11px] font-bold text-gray-900 leading-snug mb-1 line-clamp-2">{item.name}</p>
                  <p className="text-emerald-600 font-black text-xs">NT${item.points.toLocaleString()}</p>
                  <div className="mt-1">
                    <div className="h-1 bg-gray-100 rounded-full">
                      <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${Math.round(((item as StoreItem & { total?: number }).total ? (1 - item.stock / ((item as StoreItem & { total?: number }).total ?? item.stock + 1)) : 0.3) * 100)}%` }} />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">剩 {item.stock} 件</p>
                  </div>
                </div>
              </Link>
            ))}
            {/* 前往商城 CTA */}
            <Link href="/store" className="shrink-0 w-36 rounded-xl border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer p-3 text-center">
              <ShoppingBag className="h-7 w-7 text-emerald-300" />
              <span className="text-[11px] text-gray-500 font-medium leading-tight">更多商品</span>
              <span className="text-[10px] text-emerald-600 font-bold">前往商城 →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜尋演唱會、藝人..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCity === city
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Flame, label: '熱門活動', value: '24', color: 'text-red-500 bg-red-50' },
            { icon: Clock, label: '即將開賣', value: '8', color: 'text-blue-500 bg-blue-50' },
            { icon: Tag, label: '限時優惠', value: '5', color: 'text-green-500 bg-green-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Event Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedCategory === 'all' ? '所有活動' : categories.find(c => c.id === selectedCategory)?.label}
            <span className="text-sm font-normal text-gray-400 ml-2">({filtered.length} 場)</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>找不到符合條件的活動</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* 回音名人堂 */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900"> 回音名人堂</h2>
              <p className="text-sm text-gray-400 mt-0.5">種下最多棵樹的鐵粉排行</p>
            </div>
            <Link href="/forest">
              <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                查看全部 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { rank: 1, name: '林大地',  trees: 48, forest: '周杰倫森林',
                image: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&q=80' },
              { rank: 2, name: '葉綠青',  trees: 35, forest: '周子瑜森林',
                image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80' },
              { rank: 3, name: '陳自然',  trees: 29, forest: '黃子弘凡森林',
                image: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=400&q=80' },
              { rank: 4, name: '王森呼',  trees: 22, forest: '周杰倫森林',
                image: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&q=80' },
              { rank: 5, name: '張碳匯',  trees: 18, forest: 'PSY 森林',
                image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&q=80' },
            ].map((fan) => (
              <div key={fan.rank} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="relative h-32 overflow-hidden bg-gray-100">
                  <img src={fan.image} alt={fan.forest} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg
                    ${fan.rank === 1 ? 'bg-yellow-400' : fan.rank === 2 ? 'bg-slate-400' : fan.rank === 3 ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                    {fan.rank === 1 ? '' : fan.rank}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-bold text-sm leading-tight">{fan.name}</p>
                    <p className="text-white/70 text-[11px]">{fan.trees} 棵樹</p>
                  </div>
                </div>
                <div className="p-2.5 bg-white">
                  <p className="text-[11px] text-emerald-600 font-medium truncate">{fan.forest}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 論壇熱門 */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900"> 回音論壇</h2>
              <p className="text-sm text-gray-400 mt-0.5">粉絲心得・票券交流・ESG 行動</p>
            </div>
            <Link href="/forum">
              <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                進入論壇 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { id: 'p1', title: 'PSY 濕身演唱會 — 強烈建議帶換洗衣物！！', replies: 87, cat: '活動討論', hot: true },
              { id: 'p3', title: '回音森林名人堂第一名達成！分享種樹心得 ', replies: 156, cat: '粉絲心得', hot: true },
              { id: 'p5', title: '每買一張票就種一棵樹 — Echo Tree ESG 機制超詳細解說', replies: 203, cat: 'ESG 行動', hot: true },
            ].map(post => (
              <Link key={post.id} href={`/forum/${post.id}`}>
                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{post.cat}</span>
                      {post.hot && <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full"> 熱門</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                    <MessageSquare className="h-3.5 w-3.5" />{post.replies}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
