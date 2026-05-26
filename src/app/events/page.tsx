'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Calendar, Play } from 'lucide-react'
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
          {event.videoId && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-1 rounded-full">
              <Play className="h-3 w-3 fill-white" />
              預告片
            </div>
          )}
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

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCity, setSelectedCity] = useState('全部城市')
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents).catch(() => {})
  }, [])

  const filtered = events.filter(e => {
    const matchCategory = selectedCategory === 'all' || e.category === selectedCategory
    const matchCity = selectedCity === '全部城市' || e.city === selectedCity
    const matchSearch = !search || e.title.includes(search) || e.artist.includes(search)
    return matchCategory && matchCity && matchSearch
  })

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">所有活動</h1>
        <p className="text-gray-400 text-sm mt-0.5">探索精彩演唱會、音樂節與更多活動</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border shadow-sm p-3 mb-5 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜尋演唱會、藝人..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
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

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          共 <span className="font-bold text-gray-900">{filtered.length}</span> 場活動
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Play className="h-3 w-3" /> 有預告片的活動
        </p>
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
    </div>
  )
}
