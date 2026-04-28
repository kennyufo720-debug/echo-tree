'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Calendar, ChevronRight, Flame, Clock, Tag, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { mockEvents } from '@/lib/mock-data'
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

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCity, setSelectedCity] = useState('全部城市')
  const [search, setSearch] = useState('')

  const filtered = mockEvents.filter(e => {
    const matchCategory = selectedCategory === 'all' || e.category === selectedCategory
    const matchCity = selectedCity === '全部城市' || e.city === selectedCity
    const matchSearch = !search || e.title.includes(search) || e.artist.includes(search)
    return matchCategory && matchCity && matchSearch
  })

  const featuredEvent = mockEvents[0]

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[480px] overflow-hidden">
        <img
          src={featuredEvent.image}
          alt={featuredEvent.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg">
              <Badge className="bg-emerald-600 text-white mb-3">精選活動</Badge>
              <h1 className="text-4xl font-bold text-white mb-2">{featuredEvent.title}</h1>
              <p className="text-emerald-200 text-lg mb-2">{featuredEvent.artist}</p>
              <div className="flex gap-4 text-white/80 text-sm mb-6">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {featuredEvent.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {featuredEvent.venue}
                </span>
              </div>
              <div className="flex gap-3">
                <Link href={`/events/${featuredEvent.id}`}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    立即購票
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 bg-transparent">
                  了解更多
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 藝人周邊 */}
      <section className="bg-white border-b overflow-hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"> 藝人周邊</span>
            <span className="text-xs text-gray-400 hidden sm:inline">限量商品</span>
            <Link href="/points" className="ml-auto text-[11px] text-emerald-600 font-medium hover:underline flex items-center gap-0.5">
              全部 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { artist: '回音樹', item: 'ESG 限定帆布袋', price: 580, sold: 68,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80' },
              { artist: '回音樹', item: '簽名海報 A2', price: 350, sold: 92,
                image: 'https://img.youtube.com/vi/iLQTVMjdzvY/maxresdefault.jpg' },
              { artist: '回音樹', item: '演出紀念 T-shirt', price: 890, sold: 45,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80' },
              { artist: '回音樹', item: '植樹認養憑證', price: 1200, sold: 31,
                image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&q=80' },
              { artist: '回音樹', item: '限量徽章組', price: 280, sold: 77,
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&q=80' },
              { artist: 'PSY', item: '江南大叔 濕身 T-shirt', price: 990, sold: 55,
                image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&q=80' },
              { artist: 'PSY', item: '限定騎馬舞徽章', price: 380, sold: 83,
                image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&q=80' },
            ].map((merch, i) => (
              <div key={i} className="shrink-0 w-36 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-gray-100">
                <div className="h-24 overflow-hidden bg-gray-100">
                  <img src={merch.image} alt={merch.item} className="w-full h-full object-cover" />
                </div>
                <div className="p-2 bg-white">
                  <p className="text-[10px] text-gray-400 mb-0.5">{merch.artist}</p>
                  <p className="text-[11px] font-bold text-gray-900 leading-tight mb-1">{merch.item}</p>
                  <p className="text-emerald-600 font-bold text-xs">NT$ {merch.price}</p>
                  <div className="mt-1">
                    <div className="h-1 bg-gray-100 rounded-full">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${merch.sold}%` }} />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">已售 {merch.sold}%</p>
                  </div>
                </div>
              </div>
            ))}
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
            <div className="flex gap-2 flex-wrap">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
