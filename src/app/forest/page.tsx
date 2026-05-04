'use client'
import { useState } from 'react'
import { MapPin, TreePine, Leaf, Navigation, Crown, Medal, Locate, ChevronRight, Users, Music2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ── Artist Forests ──────────────────────────────────
const artistForests = [
  {
    id: 'tzuyu',
    name: '子瑜森林',
    artist: '周子瑜',
    initial: '瑜',
    trees: 156,
    co2: 3980,
    fans: 4820,
    badge: '守護天使',
    color: '#34d399',
    gradFrom: 'from-emerald-300',
    gradTo: 'to-teal-500',
    bg: 'from-emerald-400 to-teal-500',
    textColor: 'text-emerald-700',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80',
    mapX: 22, mapY: 25,
    zone: '馬來西亞 吉蘭州 ACACIA 森林',
    description: 'ACACIA 森林為一處退化森林，適合進行永續森林再造，結合當地住民共同守護這片珍貴的土地，每棵樹都是跨越國界的 ESG 行動。',
  },
  {
    id: 'huangzihongfan',
    name: '黃子弘凡森林',
    artist: '黃子弘凡',
    initial: '弘',
    trees: 134,
    co2: 3421,
    fans: 3650,
    badge: '生態先鋒',
    color: '#059669',
    gradFrom: 'from-green-400',
    gradTo: 'to-emerald-600',
    bg: 'from-green-500 to-emerald-700',
    textColor: 'text-green-700',
    lightBg: 'bg-green-50',
    borderColor: 'border-green-200',
    image: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=400&q=80',
    mapX: 62, mapY: 20,
    zone: '花蓮秀林',
    description: '花蓮秀林的深邃林地，隨著每場演出持續擴張，是台灣最具活力的音樂森林',
  },
  {
    id: 'jaychou',
    name: '周杰倫森林',
    artist: '周杰倫',
    initial: '倫',
    trees: 203,
    co2: 5180,
    fans: 12480,
    badge: '森林傳奇',
    color: '#d97706',
    gradFrom: 'from-amber-400',
    gradTo: 'to-yellow-600',
    bg: 'from-amber-400 to-yellow-500',
    textColor: 'text-amber-700',
    lightBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    image: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&q=80',
    mapX: 42, mapY: 55,
    zone: '南投仁愛',
    description: '規模最大的藝人森林，南投仁愛的百年林地見證了傑倫音樂的傳奇歲月',
  },
  {
    id: 'psy',
    name: 'PSY 森林',
    artist: 'PSY',
    initial: 'P',
    trees: 89,
    co2: 2234,
    fans: 2310,
    badge: '國際先鋒',
    color: '#7c3aed',
    gradFrom: 'from-violet-400',
    gradTo: 'to-purple-600',
    bg: 'from-violet-500 to-purple-600',
    textColor: 'text-violet-700',
    lightBg: 'bg-violet-50',
    borderColor: 'border-violet-200',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&q=80',
    mapX: 78, mapY: 60,
    zone: '宜蘭大同',
    description: '橫跨韓台的國際森林，每棵樹都是一次跨文化的 ESG 行動，Gangnam Style！',
  },
]

// ── Hall of Fame (fans) ──────────────────────────────
const hallOfFame = [
  { rank: 1, name: '林大地', trees: 48, co2: 1240, events: 12, badge: '森林守護者', avatar: '', forest: '周杰倫森林' },
  { rank: 2, name: '葉綠青', trees: 35, co2: 892, events: 9, badge: '生態先鋒', avatar: '', forest: '周子瑜森林' },
  { rank: 3, name: '陳自然', trees: 29, co2: 731, events: 7, badge: '綠能使者', avatar: '', forest: '黃子弘凡森林' },
  { rank: 4, name: '王森呼', trees: 22, co2: 568, events: 6, badge: '種樹達人', avatar: '', forest: '周杰倫森林' },
  { rank: 5, name: '張碳匯', trees: 18, co2: 445, events: 5, badge: '固碳英雄', avatar: '', forest: 'PSY 森林' },
  { rank: 6, name: '李永續', trees: 15, co2: 380, events: 4, badge: '永續夥伴', avatar: '', forest: '周子瑜森林' },
  { rank: 7, name: '吳生態', trees: 12, co2: 298, events: 4, badge: '環保新星', avatar: '', forest: '黃子弘凡森林' },
  { rank: 8, name: '黃氧氣', trees: 10, co2: 250, events: 3, badge: '環保新星', avatar: '', forest: 'PSY 森林' },
  { rank: 9, name: '劉碳零', trees: 8, co2: 198, events: 3, badge: '環保新星', avatar: '', forest: '周杰倫森林' },
  { rank: 10, name: '周山林', trees: 6, co2: 152, events: 2, badge: '初心種樹者', avatar: '', forest: '周子瑜森林' },
]

const forestZones = [
  { id: 'tzuyu', name: '馬來西亞 吉蘭州 ACACIA 森林', lat: 5.98, lng: 102.11, trees: 156 },
  { id: 'huang', name: '花蓮秀林', lat: 24.06, lng: 121.51, trees: 134 },
  { id: 'jay', name: '南投仁愛', lat: 23.96, lng: 121.15, trees: 203 },
  { id: 'psy', name: '宜蘭大同', lat: 24.68, lng: 121.54, trees: 89 },
]

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return <span className="text-sm font-bold text-gray-400 w-5 text-center">{rank}</span>
}

function ArtistAvatar({ forest, size = 'md' }: { forest: typeof artistForests[0]; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'md' ? 'w-10 h-10 text-base' : 'w-7 h-7 text-xs'
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${forest.gradFrom} ${forest.gradTo} flex items-center justify-center text-white font-bold shadow-md shrink-0`}>
      {forest.initial}
    </div>
  )
}

// 使用 vectorlogo.zone 水平 SVG 真實 logo
const CORPS = [
  { name: 'Apple',     slug: 'apple' },
  { name: 'Google',    slug: 'google' },
  { name: 'Microsoft', slug: 'microsoft' },
  { name: 'Tesla',     slug: 'tesla' },
  { name: 'Samsung',   slug: 'samsung' },
  { name: 'Sony',      slug: 'sony' },
  { name: 'BMW',       slug: 'bmw-group' },
  { name: 'IKEA',      slug: 'ikea' },
  { name: 'Siemens',   slug: 'siemens' },
  { name: 'Unilever',  slug: 'unilever' },
  { name: 'TSMC',      slug: 'tsmc' },
  { name: 'ASUS',      slug: 'asus' },
  { name: 'Acer',      slug: 'acer' },
  { name: 'MediaTek',  slug: 'mediatek' },
  { name: 'HTC',       slug: 'htc' },
  { name: 'Gogoro',    slug: 'gogoro' },
  { name: 'Tencent',   slug: 'tencent' },
  { name: 'Alibaba',   slug: 'alibaba' },
  { name: 'Panasonic', slug: 'panasonic' },
  { name: 'Philips',   slug: 'philips' },
]

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#6EE7B7']
const RANK_LABELS = ['#1', '#2', '#3', '#4']

function ForestMap({ onSelect }: { onSelect: (f: typeof artistForests[0]) => void }) {
  const [hovered, setHovered] = useState<string | null>(null)
  // 依照種樹數量排名
  const ranked = [...artistForests].sort((a, b) => b.trees - a.trees)

  return (
    <div className="space-y-3">
      {/* ── 科技感 HUD 地圖 ── */}
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ paddingBottom: '72%', border: '1px solid rgba(52,211,153,0.25)' }}
      >
        <div className="absolute inset-0">
          {/* 森林底圖 */}
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80"
            alt="forest"
            className="w-full h-full object-cover"
          />
          {/* 科技暗化遮罩 */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(2,20,10,0.82) 0%,rgba(5,46,22,0.65) 50%,rgba(1,15,8,0.88) 100%)' }} />

          {/* 格線 HUD 裝飾 */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 72" preserveAspectRatio="none" style={{ opacity: 0.08 }}>
            {[10,20,30,40,50,60,70,80,90].map(x => <line key={`vl${x}`} x1={x} y1="0" x2={x} y2="72" stroke="#4ade80" strokeWidth="0.3"/>)}
            {[12,24,36,48,60].map(y => <line key={`hl${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#4ade80" strokeWidth="0.3"/>)}
            <rect x="0" y="0" width="100" height="72" stroke="#4ade80" strokeWidth="0.5" fill="none"/>
          </svg>

          {/* 發光河流 */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 72" preserveAspectRatio="none">
            <path d="M 0 40 Q 18 32, 35 42 Q 52 52, 68 38 Q 82 26, 100 34"
              stroke="rgba(52,211,153,0.15)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M 0 40 Q 18 32, 35 42 Q 52 52, 68 38 Q 82 26, 100 34"
              stroke="rgba(52,211,153,0.55)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>

          {/* HUD 標題 左上 */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(52,211,153,0.35)', backdropFilter: 'blur(6px)' }}>
            <TreePine className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-300 text-[10px] font-mono tracking-wider">ECHO FOREST MAP</span>
          </div>

          {/* HUD 數據 右上 */}
          <div className="absolute top-2.5 right-2.5 text-right px-2.5 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(52,211,153,0.35)', backdropFilter: 'blur(6px)' }}>
            <p className="text-emerald-300 text-[11px] font-mono font-bold">{artistForests.reduce((s, f) => s + f.trees, 0).toLocaleString()} 棵</p>
            <p className="text-emerald-600 text-[9px] font-mono">4 ZONES ACTIVE</p>
          </div>

          {/* 掃描線效果 */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)',
          }} />

          {/* Artist Forest Pins — 排名排序 */}
          {ranked.map((forest, idx) => {
            const rankColor = RANK_COLORS[idx]
            const rankLabel = RANK_LABELS[idx]
            const isHov = hovered === forest.id
            return (
              <button
                key={forest.id}
                className="absolute transition-all duration-200 hover:z-20 group"
                style={{ left: `${forest.mapX}%`, top: `${forest.mapY}%`, transform: 'translate(-50%,-50%)' }}
                onClick={() => onSelect(forest)}
                onMouseEnter={() => setHovered(forest.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* HUD 卡片 */}
                <div
                  className="relative w-[74px] rounded-lg overflow-hidden transition-all duration-200"
                  style={{
                    border: `1.5px solid ${isHov ? rankColor : 'rgba(255,255,255,0.2)'}`,
                    boxShadow: isHov ? `0 0 12px ${rankColor}55, 0 0 4px ${rankColor}88` : 'none',
                    transform: isHov ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {/* 排名徽章 */}
                  <div
                    className="absolute -top-0.5 -left-0.5 z-20 w-5 h-5 rounded-br-lg flex items-center justify-center"
                    style={{ background: rankColor }}
                  >
                    <span className="text-black text-[8px] font-black leading-none">{rankLabel}</span>
                  </div>

                  {/* 森林圖片 */}
                  <div className="relative">
                    <img src={forest.image} alt={forest.name} className="w-full h-10 object-cover" />
                    {/* 掃描線 */}
                    <div className="absolute inset-0" style={{
                      background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)',
                    }}/>
                    {/* 圖片上的綠色光暈 */}
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${rankColor}22 0%, transparent 60%)` }}/>
                  </div>

                  {/* 數據面板 */}
                  <div className="px-1.5 py-1" style={{ background: 'rgba(2,15,8,0.92)' }}>
                    <p className="text-[8px] font-mono leading-tight truncate" style={{ color: rankColor }}>{forest.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-emerald-500 text-[7px] font-mono">🌳</span>
                      <span className="text-emerald-300 text-[7px] font-mono font-bold">{forest.trees}</span>
                      <span className="text-gray-600 text-[7px] font-mono ml-auto">{forest.zone}</span>
                    </div>
                  </div>
                </div>

                {/* 位置點 */}
                <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ background: rankColor, boxShadow: `0 0 6px ${rankColor}` }}/>

                {/* Tooltip */}
                {isHov && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap z-30 rounded-lg px-3 py-2 text-left"
                    style={{ background: 'rgba(2,15,8,0.95)', border: `1px solid ${rankColor}66`, boxShadow: `0 0 16px ${rankColor}33` }}>
                    <p className="font-mono text-[10px] font-bold" style={{ color: rankColor }}>{rankLabel} {forest.name}</p>
                    <p className="text-emerald-400 text-[9px] font-mono">{forest.trees} 棵 · {forest.co2.toLocaleString()} kg CO₂</p>
                    <p className="text-emerald-600 text-[9px] font-mono">{forest.zone} · {forest.fans.toLocaleString()} 粉絲</p>
                  </div>
                )}
              </button>
            )
          })}

          {/* 圖例 — 排名順序 */}
          <div className="absolute bottom-2.5 left-2.5 rounded-lg px-2 py-1.5 space-y-1"
            style={{ background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(52,211,153,0.2)', backdropFilter: 'blur(6px)' }}>
            {ranked.map((f, i) => (
              <div key={f.id} className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono font-bold w-4" style={{ color: RANK_COLORS[i] }}>{RANK_LABELS[i]}</span>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: RANK_COLORS[i] }}/>
                <span className="text-[9px] font-mono text-emerald-300">{f.name}</span>
                <span className="text-[8px] font-mono text-emerald-600 ml-1">{f.trees}棵</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 企業贊助跑馬燈（地圖外，真實 logo 水平橫式） ── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(52,211,153,0.15)', background: 'rgba(2,10,5,0.92)' }}>
        <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: '1px solid rgba(52,211,153,0.12)' }}>
          <TreePine className="h-3 w-3 text-emerald-600" />
          <span className="text-emerald-400 text-[9px] font-mono tracking-[0.2em]">感謝企業一起愛地球</span>
          <span className="text-emerald-700 text-[9px] font-mono ml-auto">ESG PARTNERS</span>
        </div>
        <div className="overflow-hidden py-3 px-2">
          <div className="flex items-center gap-8" style={{ animation: 'corp-scroll 65s linear infinite', width: 'max-content' }}>
            {[...CORPS, ...CORPS].map((corp, i) => (
              <div key={i} className="shrink-0 flex items-center">
                <img
                  src={`https://www.vectorlogo.zone/logos/${corp.slug}/${corp.slug}-ar21.svg`}
                  alt={corp.name}
                  style={{
                    height: '22px',
                    width: 'auto',
                    maxWidth: '88px',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.7,
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.style.display = 'none'
                    const span = img.nextElementSibling as HTMLElement
                    if (span) span.style.display = 'inline'
                  }}
                />
                <span
                  style={{ display: 'none' }}
                  className="text-white/60 text-[11px] font-bold tracking-widest uppercase"
                >
                  {corp.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes corp-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

export default function ForestPage() {
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; city: string } | null>(null)
  const [gpsError, setGpsError] = useState('')
  const [selectedForest, setSelectedForest] = useState<typeof artistForests[0] | null>(null)
  const [nearestZone, setNearestZone] = useState<typeof forestZones[0] | null>(null)

  const handleGPS = () => {
    setGpsLoading(true)
    setGpsError('')
    if (!navigator.geolocation) {
      setGpsError('您的裝置不支援 GPS 定位')
      setGpsLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        let nearest = forestZones[0]
        let minDist = Infinity
        forestZones.forEach(zone => {
          const d = Math.sqrt((zone.lat - latitude) ** 2 + (zone.lng - longitude) ** 2)
          if (d < minDist) { minDist = d; nearest = zone }
        })
        setGpsLocation({ lat: latitude, lng: longitude, city: '您的位置' })
        setNearestZone(nearest)
        setGpsLoading(false)
      },
      () => {
        setGpsLocation({ lat: 25.033, lng: 121.565, city: '台北市信義區（模擬）' })
        setNearestZone(forestZones[0])
        setGpsLoading(false)
      },
      { timeout: 5000 }
    )
  }

  const totalTrees = artistForests.reduce((s, f) => s + f.trees, 0)
  const totalCo2 = artistForests.reduce((s, f) => s + f.co2, 0)
  const totalFans = artistForests.reduce((s, f) => s + f.fans, 0)

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200">
          <TreePine className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">回音森林名人堂</h1>
        <p className="text-gray-400 text-sm mt-1">每一張票，種下一棵樹，守護台灣山林</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '總種樹數', value: totalTrees, unit: '棵', icon: '' },
          { label: '累積固碳', value: `${(totalCo2 / 1000).toFixed(1)}`, unit: '噸 CO₂', icon: '' },
          { label: '參與粉絲', value: `${(totalFans / 1000).toFixed(1)}K`, unit: '人', icon: '' },
        ].map(stat => (
          <div key={stat.label} className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-3 text-center border border-emerald-100">
            <div className="text-xl mb-1">{stat.icon}</div>
            <p className="text-xl font-bold text-emerald-700">{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.unit}</p>
            <p className="text-[10px] text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="map">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="map" className="flex-1"> 森林地圖</TabsTrigger>
          <TabsTrigger value="ranking" className="flex-1"> 排行榜</TabsTrigger>
          <TabsTrigger value="gps" className="flex-1"> GPS 定位</TabsTrigger>
        </TabsList>

        {/* ── Map Tab ── */}
        <TabsContent value="map" className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-700 flex gap-2">
            <Leaf className="h-4 w-4 shrink-0 mt-0.5" />
            <span>點擊地圖上的藝人森林卡片，查看詳細資訊與粉絲種樹數據。</span>
          </div>

          <ForestMap onSelect={setSelectedForest} />

          {/* Selected Forest Detail */}
          {selectedForest && (
            <div className={`rounded-2xl overflow-hidden border-2 ${selectedForest.borderColor} shadow-md`}>
              <div className="relative h-32 overflow-hidden">
                <img src={selectedForest.image} alt={selectedForest.name} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-r ${selectedForest.bg} opacity-70`} />
                <div className="absolute inset-0 flex items-center px-4 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/60 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedForest.initial}
                  </div>
                  <div className="text-white">
                    <p className="text-xl font-bold">{selectedForest.name}</p>
                    <p className="text-white/80 text-sm">{selectedForest.artist} · {selectedForest.zone}</p>
                    <Badge className="bg-white/20 text-white border-white/40 text-xs mt-1">{selectedForest.badge}</Badge>
                  </div>
                  <button onClick={() => setSelectedForest(null)} className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 rounded-full w-7 h-7 flex items-center justify-center text-white text-sm">×</button>
                </div>
              </div>
              <div className={`${selectedForest.lightBg} p-4`}>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{selectedForest.description}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '種樹數', value: selectedForest.trees, unit: '棵' },
                    { label: '固碳量', value: `${(selectedForest.co2 / 1000).toFixed(1)}`, unit: '噸 CO₂' },
                    { label: '粉絲參與', value: selectedForest.fans.toLocaleString(), unit: '人' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-2.5 text-center shadow-sm">
                      <p className={`font-bold text-sm ${selectedForest.textColor}`}>{s.value}</p>
                      <p className="text-[10px] text-gray-400">{s.unit}</p>
                      <p className="text-[10px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Artist Forest Cards */}
          <p className="text-sm font-bold text-gray-700">四大藝人森林</p>
          <div className="space-y-3">
            {artistForests.map(forest => (
              <button
                key={forest.id}
                onClick={() => setSelectedForest(forest)}
                className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 border shadow-sm hover:shadow-md transition-all text-left overflow-hidden"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={forest.image} alt={forest.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${forest.bg} opacity-50`} />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">{forest.initial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-sm">{forest.name}</p>
                    <Badge className={`${forest.lightBg} ${forest.textColor} border-0 text-[10px]`}>{forest.badge}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-1.5">{forest.zone} · {forest.fans.toLocaleString()} 粉絲參與</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-600 font-semibold"> {forest.trees} 棵</span>
                    <span className="text-xs text-gray-400">CO₂ {(forest.co2 / 1000).toFixed(1)} 噸</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </TabsContent>

        {/* ── Ranking Tab ── */}
        <TabsContent value="ranking" className="space-y-4">
          {/* Artist Forest Ranking */}
          <p className="text-sm font-bold text-gray-700"> 藝人森林排行</p>
          <div className="grid grid-cols-2 gap-3 mb-2">
            {[...artistForests].sort((a, b) => b.trees - a.trees).map((forest, idx) => (
              <div
                key={forest.id}
                className={`rounded-2xl overflow-hidden border-2 ${idx === 0 ? 'border-yellow-300 col-span-2' : forest.borderColor} shadow-sm`}
              >
                <div className="relative h-20 overflow-hidden">
                  <img src={forest.image} alt={forest.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-r ${forest.bg} opacity-60`} />
                  <div className="absolute inset-0 flex items-center px-3 gap-2">
                    {idx === 0 && <Crown className="h-4 w-4 text-yellow-300 shrink-0" />}
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur border border-white/50 flex items-center justify-center text-white font-bold">
                      {forest.initial}
                    </div>
                    <div className="text-white min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{forest.name}</p>
                      <p className="text-white/80 text-xs">{forest.trees} 棵 · {(forest.co2/1000).toFixed(1)}t CO₂</p>
                    </div>
                    <span className="text-white font-bold text-lg">#{idx + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fan Ranking */}
          <p className="text-sm font-bold text-gray-700 mt-4"> 粉絲種樹排行</p>
          {/* Top 3 */}
          <div className="grid grid-cols-3 gap-2">
            {[hallOfFame[1], hallOfFame[0], hallOfFame[2]].map((user, idx) => {
              const isFirst = idx === 1
              return (
                <div key={user.rank} className={`text-center rounded-2xl p-3 ${isFirst ? 'bg-gradient-to-b from-yellow-50 to-amber-50 border-2 border-yellow-300 -mt-2' : 'bg-gray-50 border'}`}>
                  <div className={`mb-1 ${isFirst ? 'text-4xl' : 'text-2xl'}`}>{user.avatar}</div>
                  {isFirst && <Crown className="h-4 w-4 text-yellow-500 mx-auto mb-1" />}
                  <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                  <p className={`font-bold ${isFirst ? 'text-yellow-600 text-base' : 'text-emerald-600 text-sm'}`}>{user.trees} 棵</p>
                  <p className="text-[9px] text-gray-400 mt-0.5 truncate">{user.forest}</p>
                </div>
              )
            })}
          </div>

          {/* 4-10 */}
          <div className="space-y-2">
            {hallOfFame.slice(3).map(user => (
              <div key={user.rank} className="flex items-center gap-3 bg-white rounded-xl p-3 border shadow-sm">
                <RankIcon rank={user.rank} />
                <span className="text-xl">{user.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.forest} · {user.events} 場活動</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-600 text-sm">{user.trees} 棵</p>
                  <p className="text-xs text-gray-400">{user.co2} kg</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
            <Users className="h-5 w-5 mx-auto mb-2 text-gray-300" />
            您目前有 <span className="font-bold text-emerald-600">2 棵樹</span>，距離第 10 名還差 4 棵！
          </div>
        </TabsContent>

        {/* ── GPS Tab ── */}
        <TabsContent value="gps" className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white text-center">
            <Navigation className="h-10 w-10 mx-auto mb-3 opacity-90" />
            <h3 className="text-lg font-bold mb-1">找到您附近的藝人森林</h3>
            <p className="text-emerald-100 text-sm mb-4">開啟 GPS 定位，查看距離您最近的種樹地點</p>
            <Button onClick={handleGPS} disabled={gpsLoading} className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-6">
              <Locate className="h-4 w-4 mr-2" />
              {gpsLoading ? '定位中...' : '開啟 GPS 定位'}
            </Button>
            {gpsError && <p className="text-red-200 text-xs mt-3">{gpsError}</p>}
          </div>

          {gpsLocation && nearestZone && (() => {
            const matchForest = artistForests.find(f => f.id === nearestZone.id)
            return (
              <Card className="border-emerald-200 overflow-hidden">
                {matchForest && (
                  <div className="relative h-28">
                    <img src={matchForest.image} alt={matchForest.name} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${matchForest.bg} opacity-70`} />
                    <div className="absolute inset-0 flex items-center px-4 gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 border-2 border-white/50 flex items-center justify-center text-white font-bold text-xl">
                        {matchForest.initial}
                      </div>
                      <div className="text-white">
                        <p className="font-bold">{matchForest.name}</p>
                        <p className="text-white/80 text-xs">{nearestZone.name} · {nearestZone.trees} 棵</p>
                      </div>
                      <Sparkles className="h-5 w-5 text-yellow-300 ml-auto" />
                    </div>
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{gpsLocation.city}</p>
                      <p className="text-xs text-gray-400 font-mono">{gpsLocation.lat.toFixed(4)}°N, {gpsLocation.lng.toFixed(4)}°E</p>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                    <MapPin className="h-3.5 w-3.5 mr-1" />在地圖上查看
                  </Button>
                </CardContent>
              </Card>
            )
          })()}

          <p className="text-sm font-bold text-gray-700">四大藝人森林位置</p>
          <div className="space-y-2">
            {artistForests.map(forest => (
              <div key={forest.id} className="flex items-center gap-3 bg-white rounded-xl overflow-hidden border shadow-sm">
                <div className="w-14 h-14 relative shrink-0">
                  <img src={forest.image} alt={forest.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${forest.bg} opacity-60`} />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold">{forest.initial}</span>
                </div>
                <div className="flex-1 py-3">
                  <p className="font-semibold text-sm text-gray-900">{forest.name}</p>
                  <p className="text-xs text-gray-400">{forest.zone}</p>
                </div>
                <div className="text-right pr-3 shrink-0">
                  <p className="font-bold text-emerald-600 text-sm">{forest.trees} 棵</p>
                  <Button size="sm" variant="ghost" className="text-xs text-emerald-600 h-6 px-2 mt-0.5">
                    導航 <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
