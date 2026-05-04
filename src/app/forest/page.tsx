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
    mapX: 22, mapY: 25, globeX: 34, globeY: 62,
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
    mapX: 62, mapY: 20, globeX: 68, globeY: 40,
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
    mapX: 42, mapY: 55, globeX: 62, globeY: 52,
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
    mapX: 78, mapY: 60, globeX: 74, globeY: 30,
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
  const [pulsing, setPulsing] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const ranked = [...artistForests].sort((a, b) => b.trees - a.trees)

  const handleClick = (forest: typeof artistForests[0]) => {
    setActiveId(forest.id)
    setPulsing(forest.id)
    setTimeout(() => setPulsing(null), 1100)
    onSelect(forest)
  }

  const activeIdx = ranked.findIndex(r => r.id === activeId)
  const activeColor = activeIdx >= 0 ? RANK_COLORS[activeIdx] : null

  return (
    <div className="space-y-3">
      {/* ── 地球球體 ── */}
      <div className="flex flex-col items-center gap-3">

        {/* 球體容器 */}
        <div className="relative" style={{ width: '290px', height: '290px' }}>

          {/* 大氣層外發光 */}
          <div className="absolute rounded-full pointer-events-none" style={{
            inset: '-18px',
            background: activeColor
              ? `radial-gradient(circle, ${activeColor}22 60%, transparent 100%)`
              : 'radial-gradient(circle, rgba(52,211,153,0.12) 60%, transparent 100%)',
            transition: 'background 0.8s ease',
          }} />

          {/* 軌道環 HUD */}
          <div className="absolute rounded-full pointer-events-none" style={{
            inset: '-6px',
            border: '1px solid rgba(52,211,153,0.22)',
            animation: 'orbit-spin 22s linear infinite',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%,-50%)', width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
          </div>
          <div className="absolute rounded-full pointer-events-none" style={{
            inset: '-14px',
            border: '1px dashed rgba(52,211,153,0.10)',
            animation: 'orbit-spin 40s linear infinite reverse',
          }} />

          {/* 球體主體 */}
          <div className="absolute inset-0 rounded-full overflow-hidden" style={{
            boxShadow: activeColor
              ? `0 0 50px ${activeColor}55, 0 20px 60px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.5)`
              : '0 0 40px rgba(52,211,153,0.18), 0 20px 60px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.5)',
            transition: 'box-shadow 0.7s ease',
          }}>
            {/* 森林底圖（Planet Forest） */}
            <img
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80"
              alt="forest globe"
              className="w-full h-full object-cover scale-125"
              style={{ filter: 'saturate(1.3) brightness(0.8)' }}
            />
            {/* 深綠科技遮罩 */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(5,46,22,0.4) 0%, rgba(2,15,8,0.7) 100%)',
            }} />
            {/* 3D 球體光照 */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.18) 0%, transparent 48%), radial-gradient(circle at 72% 76%, rgba(0,0,0,0.65) 0%, transparent 42%)',
            }} />
            {/* 球體邊緣暗化 */}
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 55px rgba(0,0,0,0.75)' }} />
            {/* 掃描線 */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)',
            }} />
          </div>

          {/* 球體上的 HUD 文字 */}
          <div className="absolute inset-0 flex flex-col items-center justify-between py-5 pointer-events-none">
            <span className="text-[8px] font-mono tracking-[0.25em] text-emerald-400/70">ECHO FOREST GLOBE</span>
            <div className="text-center">
              <p className="text-emerald-300 text-sm font-mono font-bold">{artistForests.reduce((s, f) => s + f.trees, 0)} 棵</p>
              <p className="text-emerald-600 text-[8px] font-mono">4 FORESTS ACTIVE</p>
            </div>
          </div>

          {/* 森林 Pin 點 */}
          {ranked.map((forest, idx) => {
            const rankColor = RANK_COLORS[idx]
            const isActive = activeId === forest.id
            const isPulsing = pulsing === forest.id
            const isHov = hovered === forest.id
            const gx = (forest as typeof forest & { globeX: number }).globeX
            const gy = (forest as typeof forest & { globeY: number }).globeY
            return (
              <button
                key={forest.id}
                className="absolute z-10 transition-all duration-300"
                style={{ left: `${gx}%`, top: `${gy}%`, transform: 'translate(-50%,-50%)' }}
                onClick={() => handleClick(forest)}
                onMouseEnter={() => setHovered(forest.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* 脈衝擴散環 */}
                {isPulsing && <>
                  <div style={{
                    position: 'absolute', inset: '-10px', borderRadius: '50%',
                    background: rankColor, animation: 'pin-pulse 1.1s ease-out forwards',
                  }} />
                  <div style={{
                    position: 'absolute', inset: '-6px', borderRadius: '50%',
                    border: `2px solid ${rankColor}`, animation: 'ring-expand 1.1s ease-out forwards',
                  }} />
                  <div style={{
                    position: 'absolute', inset: '-18px', borderRadius: '50%',
                    border: `1px solid ${rankColor}88`, animation: 'ring-expand 1.1s 0.15s ease-out forwards',
                  }} />
                </>}

                {/* Pin 本體 */}
                <div style={{
                  width: isActive ? '22px' : isHov ? '18px' : '13px',
                  height: isActive ? '22px' : isHov ? '18px' : '13px',
                  borderRadius: '50%',
                  background: rankColor,
                  border: '2px solid rgba(255,255,255,0.9)',
                  boxShadow: `0 0 ${isActive ? 18 : isHov ? 10 : 5}px ${rankColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  animation: isPulsing ? 'pin-bounce 0.5s cubic-bezier(0.34,1.56,0.64,1)' : undefined,
                }}>
                  <span style={{ fontSize: '6px', fontWeight: 900, color: '#000', lineHeight: 1 }}>{idx + 1}</span>
                </div>

                {/* Hover / Active 標籤 */}
                {(isHov || isActive) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 whitespace-nowrap z-30 rounded-lg px-2.5 py-1.5"
                    style={{
                      background: 'rgba(2,12,6,0.96)',
                      border: `1px solid ${rankColor}55`,
                      boxShadow: `0 0 20px ${rankColor}22`,
                      animation: 'label-pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    }}>
                    <p style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, color: rankColor }}>#{idx + 1} {forest.name}</p>
                    <p style={{ fontSize: '8px', fontFamily: 'monospace', color: 'rgba(52,211,153,0.65)' }}>🌳 {forest.trees} 棵 · {forest.zone}</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* 排名列表（可點擊，連動地球） */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {ranked.map((f, i) => (
            <button
              key={f.id}
              onClick={() => handleClick(f)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 text-left"
              style={{
                background: activeId === f.id ? `${RANK_COLORS[i]}18` : 'rgba(2,10,5,0.85)',
                border: `1px solid ${activeId === f.id ? RANK_COLORS[i] : 'rgba(52,211,153,0.12)'}`,
                boxShadow: activeId === f.id ? `0 0 12px ${RANK_COLORS[i]}22` : 'none',
              }}
            >
              <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 900, color: RANK_COLORS[i], minWidth: '20px' }}>#{i + 1}</span>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: RANK_COLORS[i], flexShrink: 0 }} />
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(52,211,153,0.85)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{f.name}</span>
              <span style={{ fontSize: '8px', fontFamily: 'monospace', color: 'rgba(52,211,153,0.4)', flexShrink: 0 }}>{f.trees}棵</span>
            </button>
          ))}
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
        @keyframes orbit-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pin-pulse {
          0%   { transform: scale(1);   opacity: 0.55; }
          100% { transform: scale(4.5); opacity: 0; }
        }
        @keyframes ring-expand {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes pin-bounce {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.6); }
          65%  { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
        @keyframes label-pop {
          0%   { transform: translate(-50%, 6px) scale(0.88); opacity: 0; }
          100% { transform: translate(-50%, 0)   scale(1);    opacity: 1; }
        }
        @keyframes forest-detail-enter {
          0%   { opacity: 0; transform: translateY(28px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
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
            <div
              key={selectedForest.id}
              className={`rounded-2xl overflow-hidden border-2 ${selectedForest.borderColor} shadow-md`}
              style={{ animation: 'forest-detail-enter 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
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
