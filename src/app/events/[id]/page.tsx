'use client'
import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar, MapPin, Clock, ChevronLeft, Info,
  Minus, Plus, ShoppingCart, Users, AlertCircle,
  Play, X, Minimize2, Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockEvents, mockSections } from '@/lib/mock-data'
import { SeatSection, Seat } from '@/lib/types'
import { getUser } from '@/lib/store'

interface SelectedSeat {
  sectionId: string
  sectionName: string
  row: string
  seatNumber: number
  price: number
}

function SeatMap({
  sections,
  selectedSeats,
  onToggleSeat,
  maxSeats,
}: {
  sections: SeatSection[]
  selectedSeats: SelectedSeat[]
  onToggleSeat: (seat: SelectedSeat) => void
  maxSeats: number
}) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const isSelected = (sectionId: string, row: string, num: number) =>
    selectedSeats.some(s => s.sectionId === sectionId && s.row === row && s.seatNumber === num)

  return (
    <div className="space-y-4">
      {/* Venue Overview */}
      <div className="bg-gray-900 rounded-2xl p-6 text-center">
        <div className="text-gray-400 text-xs mb-4 tracking-widest">STAGE / 舞台</div>
        <div className="bg-gradient-to-b from-emerald-500/30 to-transparent rounded-lg h-8 mb-6 flex items-center justify-center">
          <span className="text-white text-xs font-bold"> 舞台 </span>
        </div>

        {/* Section Overview Map */}
        <div className="grid gap-3">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={`w-full rounded-xl p-3 transition-all border-2 ${
                activeSection === section.id
                  ? 'border-white scale-[1.02]'
                  : 'border-transparent hover:border-white/30'
              }`}
              style={{ backgroundColor: section.color + '40' }}
            >
              <div className="flex justify-between items-center text-white">
                <span className="font-bold">{section.name}</span>
                <span className="text-sm opacity-80">NT$ {section.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs mt-1 opacity-70 text-white">
                <span>剩餘 {section.availableSeats.toLocaleString()} 座</span>
                <span>點選選位</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seat Grid */}
      {activeSection && (() => {
        const section = sections.find(s => s.id === activeSection)!
        return (
          <div className="bg-white rounded-2xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900">{section.name}</h4>
                <p className="text-sm text-emerald-600 font-medium">NT$ {section.price.toLocaleString()}</p>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-200" />可選</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" />已選</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-400" />已售</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="space-y-1 min-w-max">
                {section.rows.map(rowData => (
                  <div key={rowData.row} className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 w-4 text-center">{rowData.row}</span>
                    {rowData.seats.map(seat => {
                      const selected = isSelected(section.id, rowData.row, seat.number)
                      const sold = seat.status === 'sold'
                      return (
                        <button
                          key={seat.id}
                          disabled={sold || (!selected && selectedSeats.length >= maxSeats)}
                          onClick={() => !sold && onToggleSeat({
                            sectionId: section.id,
                            sectionName: section.name,
                            row: rowData.row,
                            seatNumber: seat.number,
                            price: section.price,
                          })}
                          className={`w-5 h-5 rounded text-[9px] font-bold transition-all ${
                            sold
                              ? 'bg-gray-300 cursor-not-allowed'
                              : selected
                              ? 'bg-emerald-500 text-white scale-110 shadow-md'
                              : selectedSeats.length >= maxSeats
                              ? 'bg-gray-100 cursor-not-allowed text-gray-300'
                              : 'bg-emerald-100 hover:bg-emerald-300 hover:scale-110'
                          }`}
                          title={sold ? '已售出' : `${rowData.row}排 ${seat.number}號`}
                        >
                          {selected ? '' : seat.number}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Legend */}
      <div className="flex gap-4 justify-center text-sm text-gray-500">
        {sections.map(s => (
          <div key={s.id} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
            <span>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FloatingVideo({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  const [minimized, setMinimized] = useState(false)

  return (
    <div
      className={`fixed z-50 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${
        minimized
          ? 'bottom-6 right-4 w-48 h-10'
          : 'bottom-6 right-4 w-72 sm:w-80'
      }`}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
    >
      {/* 標題列 */}
      <div className="flex items-center justify-between bg-gray-900 px-3 py-2">
        <div className="flex items-center gap-2">
          <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
          <span className="text-white text-xs font-medium truncate max-w-[120px]">
            活動預告影片
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(m => !m)}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            {minimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 影片 */}
      {!minimized && (
        <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
            title="活動預告影片"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const event = mockEvents.find(e => e.id === id) ?? mockEvents[0]
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
  const [maxSeats] = useState(4)
  const [showVideo, setShowVideo] = useState(false)

  const toggleSeat = (seat: SelectedSeat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(
        s => s.sectionId === seat.sectionId && s.row === seat.row && s.seatNumber === seat.seatNumber
      )
      if (exists) return prev.filter(s => !(s.sectionId === seat.sectionId && s.row === seat.row && s.seatNumber === seat.seatNumber))
      if (prev.length >= maxSeats) return prev
      return [...prev, seat]
    })
  }

  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0)

  const handleCheckout = () => {
    const user = getUser()
    if (!user.verified) {
      const returnUrl = encodeURIComponent(`/events/${event.id}`)
      router.push(`/verify?redirect=${returnUrl}`)
      return
    }
    const query = encodeURIComponent(JSON.stringify({
      eventId: event.id,
      eventTitle: event.title,
      seats: selectedSeats,
      total,
    }))
    router.push(`/checkout?data=${query}`)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Link href="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 mb-6 text-sm">
        <ChevronLeft className="h-4 w-4" />
        返回活動列表
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Event Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="relative h-64 rounded-2xl overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            {/* 播放按鈕 */}
            {event.videoId && !showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-full transition-all hover:scale-105"
              >
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Play className="h-3 w-3 fill-white text-white ml-0.5" />
                </div>
                活動預告
              </button>
            )}
            <div className="absolute bottom-4 left-4 text-white">
              <div className="flex gap-2 mb-2">
                {event.tags.map(tag => (
                  <Badge key={tag} className="bg-emerald-600 text-white text-xs">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <p className="text-emerald-200">{event.artist}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Calendar, label: '演出日期', value: event.date },
              { icon: Clock, label: '開演時間', value: event.time },
              { icon: MapPin, label: '演出場地', value: event.venue },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl p-4 border flex gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <item.icon className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="font-medium text-gray-900 text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Tabs defaultValue="seats">
            <TabsList className="w-full">
              <TabsTrigger value="seats" className="flex-1">選擇座位</TabsTrigger>
              <TabsTrigger value="info" className="flex-1">活動資訊</TabsTrigger>
              <TabsTrigger value="rules" className="flex-1">購票須知</TabsTrigger>
            </TabsList>

            <TabsContent value="seats" className="mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 mb-4">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">每次購票最多 {maxSeats} 張，已選 {selectedSeats.length} 張。點選區域展開座位圖。</p>
              </div>
              <SeatMap
                sections={mockSections}
                selectedSeats={selectedSeats}
                onToggleSeat={toggleSeat}
                maxSeats={maxSeats}
              />
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <div className="bg-white rounded-xl border p-5 space-y-3 text-sm text-gray-600">
                <p>本次演唱會為 {event.artist} 台灣巡迴的重點場次，將帶來全新舞台設計與精彩視覺效果。</p>
                <p>演出時間約 2.5 至 3 小時，中間無中場休息。請提早入場就座。</p>
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>預計觀眾人數：{event.totalSeats.toLocaleString()} 人</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="mt-4">
              <div className="bg-white rounded-xl border p-5 space-y-2 text-sm text-gray-600">
                {[
                  '每張訂單限購 4 張票，超過需分次購買',
                  '購票須完成手機號碼驗證 (OTP)',
                  '票券不可轉讓、不可退票，請確認後再購買',
                  '實體場館禁止攜帶食物、飲料入場',
                  '電子票券請於入場時出示 QR Code',
                ].map((rule, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-emerald-500 font-bold">{i + 1}.</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          <Card className="border-0 shadow-md sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
                訂單明細
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedSeats.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <div className="text-3xl mb-2"></div>
                  <p className="text-sm">請從座位圖選擇座位</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {selectedSeats.map((seat, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{seat.sectionName}</span>
                          <span className="text-gray-500 ml-1">{seat.row}排 {seat.seatNumber}號</span>
                        </div>
                        <span className="font-medium">NT$ {seat.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>小計</span>
                    <span className="text-emerald-600">NT$ {total.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between"><span>票券張數</span><span>{selectedSeats.length} 張</span></div>
                    <div className="flex justify-between"><span>手續費</span><span>NT$ {(total * 0.03).toFixed(0)}</span></div>
                    <div className="flex justify-between font-semibold text-gray-700 pt-1 border-t">
                      <span>總金額</span>
                      <span>NT$ {(total + total * 0.03).toFixed(0)}</span>
                    </div>
                  </div>
                </>
              )}

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={selectedSeats.length === 0}
                onClick={handleCheckout}
              >
                前往結帳
                {selectedSeats.length > 0 && ` (${selectedSeats.length} 張)`}
              </Button>

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                {getUser().verified
                  ? <span className="text-green-500"> 已驗證，可直接結帳</span>
                  : <span>結帳前需完成手機驗證</span>
                }
              </p>
            </CardContent>
          </Card>

          {/* Price Legend */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">票區票價</p>
              {mockSections.map(section => (
                <div key={section.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }} />
                    <span className="text-gray-600">{section.name}</span>
                  </div>
                  <span className="font-medium">NT$ {section.price.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 浮動影片播放器 */}
      {showVideo && event.videoId && <FloatingVideo videoId={event.videoId} onClose={() => setShowVideo(false)} />}
    </div>
  )
}
