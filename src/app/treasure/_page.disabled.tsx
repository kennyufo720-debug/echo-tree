// [MODULE: Treasure] 暫時關閉 — 此頁面導向 404，功能完整保留未刪除
// 重新啟用：刪除下面 3 行 notFound() 區塊，取消 navbar.tsx 與 forum/page.tsx 中的對應註解
// @ts-nocheck
import { notFound } from 'next/navigation'
export default function TreasurePage() { notFound() }
// ── 以下為完整頁面原始碼（暫停使用）──────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _TreasurePageOriginal() { return null }

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Gift, Sparkles, ChevronRight, Ticket, TreePine, X, CheckCircle2, ChevronLeft, Globe, Search, MessageSquare, Coins, MapPin, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 根據「獲得方式」決定目標頁面與按鈕文字
function resolveHowTarget(how: string): { href: string; label: string; icon: React.ReactNode } {
  if (/購買|票券|購票/.test(how))    return { href: '/events',  label: '前往購票',      icon: <Ticket className="h-4 w-4 mr-2" /> }
  if (/兌換.*點數|點數/.test(how))   return { href: '/points',  label: '前往兌換點數',  icon: <Coins className="h-4 w-4 mr-2" /> }
  if (/GPS|打卡|定位/.test(how))     return { href: '/forest',  label: '前往 GPS 打卡', icon: <MapPin className="h-4 w-4 mr-2" /> }
  if (/KYC|驗證|個人資料/.test(how)) return { href: '/verify',  label: '前往完成驗證',  icon: <UserCheck className="h-4 w-4 mr-2" /> }
  // 邀請好友、分享活動、完成任務 → 論壇
  return { href: '/forum', label: '前往論壇完成任務', icon: <MessageSquare className="h-4 w-4 mr-2" /> }
}

// ── Taiwan 81 Fragments (9 groups × 9) ───────────────────
type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
interface Fragment { id: string; name: string; emoji: string; rarity: Rarity; obtained: boolean; date: string | null; how: string; group: string }

const RARITY_EMOJI: Record<Rarity, string> = {
  common: '🍃', rare: '💎', epic: '🌟', legendary: '👑',
}
function fragEmoji(f: { emoji: string; rarity: Rarity }) {
  return f.emoji || RARITY_EMOJI[f.rarity]
}

// 九幅畫對應九地區，image 欄位待上傳後填入
const TW_GROUPS: { name: string; emoji: string; series: string; subtitle: string; image?: string; fragments: Omit<Fragment, 'group'>[] }[] = [
  {
    name: '台北', emoji: '🏙️', series: '根之歸屬', subtitle: 'Heritage', image: '/ziyu-forest.jpeg',
    fragments: [
      { id: 'tw01', name: '根之歸屬 01', emoji: '🌱', rarity: 'common',    obtained: true,  date: '2026-04-15', how: '購買台北場票券' },
      { id: 'tw02', name: '根之歸屬 02', emoji: '🌿', rarity: 'common',    obtained: true,  date: '2026-04-16', how: '出席ESG音樂節' },
      { id: 'tw03', name: '根之歸屬 03', emoji: '🍃', rarity: 'common',    obtained: true,  date: '2026-04-18', how: 'GPS打卡台北場地' },
      { id: 'tw04', name: '根之歸屬 04', emoji: '🌲', rarity: 'rare',      obtained: false, date: null, how: '購買第2張台北場票' },
      { id: 'tw05', name: '根之歸屬 05', emoji: '🌳', rarity: 'rare',      obtained: false, date: null, how: '兌換 800 點數' },
      { id: 'tw06', name: '根之歸屬 06', emoji: '🌴', rarity: 'common',    obtained: false, date: null, how: '邀請 1 位好友' },
      { id: 'tw07', name: '根之歸屬 07', emoji: '🪵', rarity: 'rare',      obtained: false, date: null, how: '分享活動至社群' },
      { id: 'tw08', name: '根之歸屬 08', emoji: '🌾', rarity: 'epic',      obtained: false, date: null, how: '完成個人資料驗證' },
      { id: 'tw09', name: '根之歸屬 09', emoji: '👑', rarity: 'legendary', obtained: false, date: null, how: '集齊根之歸屬 01–08' },
    ],
  },
  {
    name: '新北', emoji: '🌉', series: '森之呼吸', subtitle: 'Forestry',
    fragments: [
      { id: 'tw10', name: '森之呼吸 01', emoji: '🌬️', rarity: 'common',    obtained: false, date: null, how: '購買新北場票券' },
      { id: 'tw11', name: '森之呼吸 02', emoji: '🌲', rarity: 'common',    obtained: false, date: null, how: 'GPS打卡平溪' },
      { id: 'tw12', name: '森之呼吸 03', emoji: '🌿', rarity: 'common',    obtained: false, date: null, how: '邀請好友' },
      { id: 'tw13', name: '森之呼吸 04', emoji: '🍃', rarity: 'rare',      obtained: false, date: null, how: '完成任務' },
      { id: 'tw14', name: '森之呼吸 05', emoji: '🌳', rarity: 'rare',      obtained: false, date: null, how: '購票折抵使用' },
      { id: 'tw15', name: '森之呼吸 06', emoji: '🌾', rarity: 'common',    obtained: false, date: null, how: '分享活動' },
      { id: 'tw16', name: '森之呼吸 07', emoji: '🪨', rarity: 'rare',      obtained: false, date: null, how: '兌換點數商品' },
      { id: 'tw17', name: '森之呼吸 08', emoji: '🌱', rarity: 'epic',      obtained: false, date: null, how: '完成KYC驗證' },
      { id: 'tw18', name: '森之呼吸 09', emoji: '🏆', rarity: 'legendary', obtained: false, date: null, how: '集齊森之呼吸 01–08' },
    ],
  },
  {
    name: '桃竹苗', emoji: '💧', series: '凝水成鑽', subtitle: 'Water',
    fragments: [
      { id: 'tw19', name: '凝水成鑽 01', emoji: '💧', rarity: 'common',    obtained: false, date: null, how: '購買桃竹苗場票券' },
      { id: 'tw20', name: '凝水成鑽 02', emoji: '🌊', rarity: 'common',    obtained: false, date: null, how: 'GPS打卡' },
      { id: 'tw21', name: '凝水成鑽 03', emoji: '🫧', rarity: 'common',    obtained: false, date: null, how: '邀請好友' },
      { id: 'tw22', name: '凝水成鑽 04', emoji: '🌀', rarity: 'rare',      obtained: false, date: null, how: '完成任務' },
      { id: 'tw23', name: '凝水成鑽 05', emoji: '🔵', rarity: 'rare',      obtained: false, date: null, how: '購票折抵' },
      { id: 'tw24', name: '凝水成鑽 06', emoji: '💎', rarity: 'rare',      obtained: false, date: null, how: '分享活動' },
      { id: 'tw25', name: '凝水成鑽 07', emoji: '🌧️', rarity: 'epic',      obtained: false, date: null, how: '兌換商品' },
      { id: 'tw26', name: '凝水成鑽 08', emoji: '❄️', rarity: 'epic',      obtained: false, date: null, how: '完成評價' },
      { id: 'tw27', name: '凝水成鑽 09', emoji: '👑', rarity: 'legendary', obtained: false, date: null, how: '集齊凝水成鑽 01–08' },
    ],
  },
  {
    name: '台中', emoji: '⚡', series: '風之羽翼', subtitle: 'Energy',
    fragments: [
      { id: 'tw28', name: '風之羽翼 01', emoji: '🌬️', rarity: 'common',    obtained: false, date: null, how: '購買台中場票券' },
      { id: 'tw29', name: '風之羽翼 02', emoji: '💨', rarity: 'common',    obtained: false, date: null, how: 'GPS打卡台中' },
      { id: 'tw30', name: '風之羽翼 03', emoji: '🕊️', rarity: 'common',    obtained: false, date: null, how: '邀請好友' },
      { id: 'tw31', name: '風之羽翼 04', emoji: '⚡', rarity: 'rare',      obtained: false, date: null, how: '完成任務' },
      { id: 'tw32', name: '風之羽翼 05', emoji: '🌪️', rarity: 'rare',      obtained: false, date: null, how: '兌換 1200 點數' },
      { id: 'tw33', name: '風之羽翼 06', emoji: '🌈', rarity: 'common',    obtained: false, date: null, how: '分享活動' },
      { id: 'tw34', name: '風之羽翼 07', emoji: '🦅', rarity: 'rare',      obtained: false, date: null, how: '完成評價' },
      { id: 'tw35', name: '風之羽翼 08', emoji: '🔋', rarity: 'epic',      obtained: false, date: null, how: '購票折抵' },
      { id: 'tw36', name: '風之羽翼 09', emoji: '👑', rarity: 'legendary', obtained: false, date: null, how: '集齊風之羽翼 01–08' },
    ],
  },
  {
    name: '南投', emoji: '🌍', series: '土之溫度', subtitle: 'Social',
    fragments: [
      { id: 'tw37', name: '土之溫度 01', emoji: '🌍', rarity: 'common',    obtained: false, date: null, how: '購買南投場票券' },
      { id: 'tw38', name: '土之溫度 02', emoji: '🌱', rarity: 'common',    obtained: false, date: null, how: 'GPS打卡仁愛鄉' },
      { id: 'tw39', name: '土之溫度 03', emoji: '🏡', rarity: 'rare',      obtained: false, date: null, how: '邀請好友' },
      { id: 'tw40', name: '土之溫度 04', emoji: '🤝', rarity: 'rare',      obtained: false, date: null, how: '完成任務' },
      { id: 'tw41', name: '土之溫度 05', emoji: '🌾', rarity: 'rare',      obtained: false, date: null, how: '兌換點數' },
      { id: 'tw42', name: '土之溫度 06', emoji: '🧡', rarity: 'epic',      obtained: false, date: null, how: '分享活動' },
      { id: 'tw43', name: '土之溫度 07', emoji: '🌻', rarity: 'common',    obtained: false, date: null, how: '完成評價' },
      { id: 'tw44', name: '土之溫度 08', emoji: '🏔️', rarity: 'epic',      obtained: false, date: null, how: '購買子瑜見面會門票' },
      { id: 'tw45', name: '土之溫度 09', emoji: '👑', rarity: 'legendary', obtained: false, date: null, how: '集齊土之溫度 01–08' },
    ],
  },
  {
    name: '雲嘉南', emoji: '🤲', series: '息之共生', subtitle: 'Diversity',
    fragments: [
      { id: 'tw46', name: '息之共生 01', emoji: '🤲', rarity: 'common',    obtained: false, date: null, how: '購買雲嘉南場票券' },
      { id: 'tw47', name: '息之共生 02', emoji: '🌿', rarity: 'common',    obtained: false, date: null, how: 'GPS打卡' },
      { id: 'tw48', name: '息之共生 03', emoji: '🦋', rarity: 'common',    obtained: false, date: null, how: '邀請好友' },
      { id: 'tw49', name: '息之共生 04', emoji: '🌸', rarity: 'rare',      obtained: false, date: null, how: '完成任務' },
      { id: 'tw50', name: '息之共生 05', emoji: '🫂', rarity: 'rare',      obtained: false, date: null, how: '兌換點數' },
      { id: 'tw51', name: '息之共生 06', emoji: '🌍', rarity: 'common',    obtained: false, date: null, how: '分享活動' },
      { id: 'tw52', name: '息之共生 07', emoji: '🌺', rarity: 'epic',      obtained: false, date: null, how: '完成評價' },
      { id: 'tw53', name: '息之共生 08', emoji: '🕊️', rarity: 'rare',      obtained: false, date: null, how: '購票折抵' },
      { id: 'tw54', name: '息之共生 09', emoji: '🏆', rarity: 'legendary', obtained: false, date: null, how: '集齊息之共生 01–08' },
    ],
  },
  {
    name: '高屏', emoji: '🔆', series: '光之折射', subtitle: 'Hope',
    fragments: [
      { id: 'tw55', name: '光之折射 01', emoji: '☀️', rarity: 'common',    obtained: false, date: null, how: '購買高雄場票券' },
      { id: 'tw56', name: '光之折射 02', emoji: '🌟', rarity: 'common',    obtained: false, date: null, how: 'GPS打卡高雄巨蛋' },
      { id: 'tw57', name: '光之折射 03', emoji: '✨', rarity: 'rare',      obtained: false, date: null, how: '邀請好友' },
      { id: 'tw58', name: '光之折射 04', emoji: '🌈', rarity: 'rare',      obtained: false, date: null, how: '完成任務' },
      { id: 'tw59', name: '光之折射 05', emoji: '💡', rarity: 'common',    obtained: false, date: null, how: '兌換點數' },
      { id: 'tw60', name: '光之折射 06', emoji: '🔆', rarity: 'epic',      obtained: false, date: null, how: '分享活動' },
      { id: 'tw61', name: '光之折射 07', emoji: '🌅', rarity: 'common',    obtained: false, date: null, how: '完成評價' },
      { id: 'tw62', name: '光之折射 08', emoji: '🌠', rarity: 'rare',      obtained: false, date: null, how: '購票折抵' },
      { id: 'tw63', name: '光之折射 09', emoji: '👑', rarity: 'legendary', obtained: false, date: null, how: '集齊光之折射 01–08' },
    ],
  },
  {
    name: '花蓮', emoji: '🌊', series: '海之沉靜', subtitle: 'Ocean',
    fragments: [
      { id: 'tw64', name: '海之沉靜 01', emoji: '🌊', rarity: 'common',    obtained: false, date: null, how: '購買花蓮場票券' },
      { id: 'tw65', name: '海之沉靜 02', emoji: '🐋', rarity: 'common',    obtained: false, date: null, how: 'GPS打卡花蓮' },
      { id: 'tw66', name: '海之沉靜 03', emoji: '🪸', rarity: 'common',    obtained: false, date: null, how: '邀請好友' },
      { id: 'tw67', name: '海之沉靜 04', emoji: '🐚', rarity: 'rare',      obtained: false, date: null, how: '完成任務' },
      { id: 'tw68', name: '海之沉靜 05', emoji: '🌀', rarity: 'rare',      obtained: false, date: null, how: '兌換點數' },
      { id: 'tw69', name: '海之沉靜 06', emoji: '💙', rarity: 'rare',      obtained: false, date: null, how: '分享活動' },
      { id: 'tw70', name: '海之沉靜 07', emoji: '🫧', rarity: 'epic',      obtained: false, date: null, how: '完成評價' },
      { id: 'tw71', name: '海之沉靜 08', emoji: '🐬', rarity: 'epic',      obtained: false, date: null, how: '購票折抵' },
      { id: 'tw72', name: '海之沉靜 09', emoji: '👑', rarity: 'legendary', obtained: false, date: null, how: '集齊海之沉靜 01–08' },
    ],
  },
  {
    name: '台東離島', emoji: '🌫️', series: '塵之洗淨', subtitle: 'Net-Zero',
    fragments: [
      { id: 'tw73', name: '塵之洗淨 01', emoji: '🌫️', rarity: 'epic',      obtained: true,  date: '2026-04-20', how: 'GPS打卡台東延平' },
      { id: 'tw74', name: '塵之洗淨 02', emoji: '🌱', rarity: 'common',    obtained: false, date: null, how: '購買台東場票券' },
      { id: 'tw75', name: '塵之洗淨 03', emoji: '🍃', rarity: 'rare',      obtained: false, date: null, how: 'GPS打卡台東' },
      { id: 'tw76', name: '塵之洗淨 04', emoji: '♻️', rarity: 'epic',      obtained: false, date: null, how: '完成任務' },
      { id: 'tw77', name: '塵之洗淨 05', emoji: '🌿', rarity: 'epic',      obtained: false, date: null, how: '兌換 1500 點數' },
      { id: 'tw78', name: '塵之洗淨 06', emoji: '☁️', rarity: 'rare',      obtained: false, date: null, how: '邀請3位好友' },
      { id: 'tw79', name: '塵之洗淨 07', emoji: '🌬️', rarity: 'rare',      obtained: false, date: null, how: '分享活動' },
      { id: 'tw80', name: '塵之洗淨 08', emoji: '🌤️', rarity: 'legendary', obtained: false, date: null, how: '購買子瑜見面會門票' },
      { id: 'tw81', name: '塵之洗淨 09', emoji: '🌟', rarity: 'legendary', obtained: false, date: null, how: '集齊全台 80 片碎片' },
    ],
  },
]

// Flatten with group info
const TW_FRAGMENTS: Fragment[] = TW_GROUPS.flatMap(g =>
  g.fragments.map(f => ({ ...f, group: g.name }))
)

// ── 系列展示面板（九宮格 + 碎片清單一體） ──────────────────
type TwGroup = typeof TW_GROUPS[0]

function SeriesPanel({ group, onSelect }: { group: TwGroup; onSelect: (f: Fragment) => void }) {
  const frags = group.fragments
  const collected = frags.filter(f => f.obtained).length
  const hasImage = !!group.image

  return (
    <div className="space-y-3">
      {/* 系列標題 */}
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-[11px] text-gray-500 font-mono uppercase tracking-widest">No.{String(TW_GROUPS.indexOf(group) + 1).padStart(2, '0')} · {group.emoji} {group.name}</p>
          <h3 className="text-xl font-bold text-white mt-0.5">{group.series}</h3>
          <p className="text-[11px] text-gray-600 font-mono tracking-widest mt-0.5">{group.subtitle}</p>
        </div>
        <span className={`text-sm font-bold ${collected === 9 ? 'text-amber-400' : 'text-emerald-400'}`}>{collected} / 9</span>
      </div>

      {/* 九宮格 */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0a0a' }}>
        <div className="grid grid-cols-3" style={{ gap: 1 }}>
          {frags.map((frag, i) => {
            const row = Math.floor(i / 3)
            const col = i % 3
            const num = String(i + 1).padStart(2, '0')
            return (
              <button
                key={frag.id}
                onClick={() => onSelect({ ...frag, group: group.name })}
                className="relative overflow-hidden group"
                style={{ aspectRatio: '1' }}
              >
                <div
                  className="absolute inset-0"
                  style={hasImage ? {
                    backgroundImage: `url(${group.image})`,
                    backgroundSize: '300% 300%',
                    backgroundPosition: `${col * 50}% ${row * 50}%`,
                    filter: frag.obtained ? 'none' : 'brightness(0.06)',
                    transition: 'filter 0.4s',
                  } : {
                    background: frag.obtained ? '#134e2a' : '#0d0d0d',
                  }}
                />
                {/* 未收集 */}
                {!frag.obtained && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <Lock className="h-4 w-4 text-gray-700" />
                    <span className="text-[10px] font-mono text-gray-700 mt-0.5">{num}</span>
                  </div>
                )}
                {/* 已收集 */}
                {frag.obtained && (
                  <>
                    <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-white/70 drop-shadow z-10">{num}</span>
                    <CheckCircle2 className="absolute bottom-1 right-1 h-3 w-3 text-emerald-400 drop-shadow z-10" />
                  </>
                )}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors z-10" />
              </button>
            )
          })}
        </div>
        {/* 進度條 */}
        <div className="h-0.5 bg-gray-900">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
            style={{ width: `${(collected / 9) * 100}%` }}
          />
        </div>
      </div>

      {/* 碎片清單 */}
      <div className="space-y-1.5">
        {frags.map((frag, i) => {
          const num = String(i + 1).padStart(2, '0')
          const r = RARITY[frag.rarity]
          return (
            <button
              key={frag.id}
              onClick={() => onSelect({ ...frag, group: group.name })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                frag.obtained
                  ? 'bg-gray-900 border-gray-800 hover:border-emerald-800'
                  : 'bg-gray-950 border-gray-900 hover:border-gray-700'
              }`}
            >
              <span className="text-[11px] font-mono text-gray-600 w-5 shrink-0">{num}</span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${frag.obtained ? 'bg-emerald-400' : 'bg-gray-800'}`} />
              <span className={`flex-1 text-sm ${frag.obtained ? 'text-white' : 'text-gray-600'}`}>
                {frag.obtained ? frag.name : '未解鎖'}
              </span>
              <span className={`text-[10px] shrink-0 ${r.color}`}>{r.label}</span>
              {frag.obtained
                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                : <ChevronRight className="h-3.5 w-3.5 text-gray-700 shrink-0" />}
            </button>
          )
        })}
      </div>

      {collected === 9 && (
        <p className="text-center text-xs text-amber-400 font-medium py-1">🎉 完整畫作已解鎖！</p>
      )}
    </div>
  )
}

// ── Region helpers ───────────────────────────────────────
function toFragments(name: string, frags: Omit<Fragment, 'group'>[]): Fragment[] {
  return frags.map(f => ({ ...f, group: name }))
}

// ── Region Data ─────────────────────────────────────────
const REGIONS: {
  id: string; name: string; flag: string; artist: string; artistInitial: string
  color: string; bgColor: string; border: string; accent: string; glow: string
  mapBg: string; mapX: number; mapY: number; fragments: Fragment[]
}[] = [
  {
    id: 'taiwan',
    name: '台灣',
    flag: '🇹🇼',
    artist: '周子瑜',
    artistInitial: '瑜',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-900/40',
    border: 'border-emerald-600',
    accent: 'text-emerald-300',
    glow: 'shadow-emerald-900',
    mapBg: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600&q=80',
    mapX: 72, mapY: 42,
    fragments: TW_FRAGMENTS,
  },
  {
    id: 'china',
    name: '中國',
    flag: '🇨🇳',
    artist: '黃子弘凡',
    artistInitial: '弘',
    color: 'from-rose-500 to-red-600',
    bgColor: 'bg-rose-900/40',
    border: 'border-rose-600',
    accent: 'text-rose-300',
    glow: 'shadow-rose-900',
    mapBg: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80',
    mapX: 54, mapY: 32,
    fragments: toFragments('中國', [
      { id: 'cn1', name: '黃山雲海碎片', emoji: '⛅', rarity: 'rare', obtained: false, date: null, how: '購買黃子弘凡中國巡演票券' },
      { id: 'cn2', name: '桂林山水碎片', emoji: '🏔️', rarity: 'epic', obtained: false, date: null, how: '兌換 2000 Echo 點數' },
      { id: 'cn3', name: '西湖春雨碎片', emoji: '🌸', rarity: 'common', obtained: false, date: null, how: '邀請 3 位好友加入' },
    ]),
  },
  {
    id: 'malaysia',
    name: '馬來西亞',
    flag: '🇲🇾',
    artist: '周子瑜',
    artistInitial: '瑜',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-900/40',
    border: 'border-blue-600',
    accent: 'text-blue-300',
    glow: 'shadow-blue-900',
    mapBg: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80',
    mapX: 60, mapY: 60,
    fragments: toFragments('馬來西亞', [
      { id: 'my1', name: '雨林彩虹碎片', emoji: '🌈', rarity: 'epic', obtained: false, date: null, how: '購買馬來西亞場票券' },
      { id: 'my2', name: '熱帶雨林碎片', emoji: '🌿', rarity: 'rare', obtained: false, date: null, how: 'GPS打卡活動現場' },
    ]),
  },
  {
    id: 'japan',
    name: '日本',
    flag: '🇯🇵',
    artist: '周子瑜',
    artistInitial: '瑜',
    color: 'from-pink-500 to-rose-400',
    bgColor: 'bg-pink-900/40',
    border: 'border-pink-600',
    accent: 'text-pink-300',
    glow: 'shadow-pink-900',
    mapBg: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
    mapX: 82, mapY: 28,
    fragments: toFragments('日本', [
      { id: 'jp1', name: '富士山雪碎片', emoji: '🗻', rarity: 'legendary', obtained: false, date: null, how: '購買日本場限定票券' },
      { id: 'jp2', name: '京都楓葉碎片', emoji: '🍁', rarity: 'epic', obtained: false, date: null, how: '完成集章活動' },
    ]),
  },
]

const REWARDS = [
  { threshold: 3,  title: '台灣森林初探', reward: '子瑜限定數位壁紙 × 3', icon: '🖼️' },
  { threshold: 6,  title: '亞洲探索者', reward: 'Echo 點數 +1000 點', icon: '💰' },
  { threshold: 9,  title: '森林守護傳說', reward: '子瑜親簽周邊兌換資格', icon: '✍️' },
  { threshold: 11, title: '子瑜全球傳奇', reward: '見面會優先入場 + 限量 NFT 憑證', icon: '👑' },
]

const RARITY: Record<string, { label: string; color: string; border: string; glow: string }> = {
  common:    { label: '普通', color: 'text-gray-400',   border: 'border-gray-700',   glow: '' },
  rare:      { label: '稀有', color: 'text-blue-400',   border: 'border-blue-600',   glow: 'shadow-blue-900/60' },
  epic:      { label: '史詩', color: 'text-purple-400', border: 'border-purple-600', glow: 'shadow-purple-900/60' },
  legendary: { label: '傳奇', color: 'text-amber-400',  border: 'border-amber-500',  glow: 'shadow-amber-900/60 shadow-lg' },
}

const ALL_FRAGMENTS: Fragment[] = REGIONS.flatMap(r => r.fragments)
const COLLECTED = ALL_FRAGMENTS.filter(f => f.obtained).length
const TOTAL = ALL_FRAGMENTS.length

export default function TreasurePage() {
  const router = useRouter()
  const [activeRegion, setActiveRegion] = useState<typeof REGIONS[0] | null>(null)
  const [activeGroup, setActiveGroup] = useState<string>('全部')
  const [fragSearch, setFragSearch] = useState('')
  const [selectedFrag, setSelectedFrag] = useState<typeof ALL_FRAGMENTS[0] | null>(null)
  const [showReward, setShowReward] = useState<typeof REWARDS[0] | null>(null)

  const pct = Math.round((COLLECTED / TOTAL) * 100)
  const nextReward = REWARDS.find(r => COLLECTED < r.threshold)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" alt="world" className="w-full h-52 object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-gray-950" />
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">限定活動</Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs"> 全球藏寶圖</Badge>
          </div>
          <h1 className="text-2xl font-bold">子瑜森林<br />碎片藏寶圖</h1>
          <p className="text-emerald-300 text-sm mt-1">跨越 4 個地區，集齊 {TOTAL} 片碎片</p>
        </div>
      </div>

      <div className="px-4 pb-12 space-y-5 container mx-auto max-w-2xl">
        {/* Progress */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">全球收集進度</span>
            <span className="text-emerald-400 font-bold">{COLLECTED} / {TOTAL}</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          {/* Per-region mini progress */}
          <div className="grid grid-cols-4 gap-2">
            {REGIONS.map(r => {
              const got = r.fragments.filter(f => f.obtained).length
              const tot = r.fragments.length
              return (
                <div key={r.id} className="text-center">
                  <div className="text-lg mb-0.5">{r.flag}</div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden mb-1">
                    <div className={`h-full bg-gradient-to-r ${r.color} rounded-full`} style={{ width: `${(got/tot)*100}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-500">{got}/{tot}</p>
                </div>
              )
            })}
          </div>
          {nextReward && (
            <div className="mt-3 bg-gray-800 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-base">{nextReward.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400">距下一獎勵</p>
                <p className="text-xs font-semibold text-white truncate">{nextReward.reward}</p>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0">差 {nextReward.threshold - COLLECTED} 片</span>
            </div>
          )}
        </div>

        {/* ── REGION VIEW ── */}
        {activeRegion ? (
          <div className="space-y-4">
            <button onClick={() => { setActiveRegion(null); setActiveGroup('全部'); setFragSearch('') }} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
              <ChevronLeft className="h-4 w-4" />返回地圖
            </button>

            {/* Region Header */}
            <div className="relative rounded-2xl overflow-hidden">
              <img src={activeRegion.mapBg} alt={activeRegion.name} className="w-full h-32 object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${activeRegion.color} opacity-60`} />
              <div className="absolute inset-0 flex items-center px-4 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/50 flex items-center justify-center text-2xl">
                  {activeRegion.flag}
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{activeRegion.name}</p>
                  <p className="text-white/80 text-xs">{activeRegion.artist} 的森林</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {activeRegion.fragments.filter(f => f.obtained).length} / {activeRegion.fragments.length} 碎片已收集
                  </p>
                </div>
              </div>
            </div>

            {/* Taiwan: 系列選擇 + 九宮格 + 碎片清單 */}
            {activeRegion.id === 'taiwan' && (() => {
              const activeGrp = TW_GROUPS.find(g => g.name === activeGroup) ?? TW_GROUPS[0]
              return (
                <>
                  {/* 系列橫向捲動選擇 */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {TW_GROUPS.map((g, idx) => {
                      const got = g.fragments.filter(f => f.obtained).length
                      const isActive = activeGroup === g.name || (activeGroup === '全部' && idx === 0)
                      return (
                        <button
                          key={g.name}
                          onClick={() => setActiveGroup(g.name)}
                          className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-emerald-700 text-white' : 'bg-gray-900 text-gray-500 hover:bg-gray-800'}`}
                        >
                          <span className="text-base">{g.emoji}</span>
                          <span>{g.name}</span>
                          <span className={`text-[9px] ${isActive ? 'text-emerald-200' : 'text-gray-700'}`}>{got}/9</span>
                        </button>
                      )
                    })}
                  </div>
                  {/* 九宮格 + 碎片清單 */}
                  <SeriesPanel group={activeGrp} onSelect={f => setSelectedFrag(f)} />
                </>
              )
            })()}

            {/* 非台灣地區：原有碎片格子 */}
            {activeRegion.id !== 'taiwan' && (() => {
              const frags = activeRegion.fragments
              return (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400" />{activeRegion.name} 碎片
                    </p>
                    <span className="text-xs text-gray-600">{frags.filter(f=>f.obtained).length}/{frags.length}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {frags.map(frag => {
                      const r = RARITY[frag.rarity]
                      return (
                        <button key={frag.id} onClick={() => setSelectedFrag(frag)}
                          className={`rounded-xl border ${frag.obtained ? r.border : 'border-dashed border-gray-800'} bg-gray-900 p-2 flex flex-col items-center gap-1 transition-all hover:scale-105`}
                        >
                          <span className={`text-2xl ${frag.obtained ? '' : 'opacity-20'}`}>
                            {frag.obtained ? fragEmoji(frag) : RARITY_EMOJI[frag.rarity as Rarity]}
                          </span>
                          <span className={`text-[9px] text-center line-clamp-2 ${frag.obtained ? 'text-white' : 'text-gray-700'}`}>
                            {frag.obtained ? frag.name : `未解鎖`}
                          </span>
                          <span className={`text-[8px] ${frag.obtained ? r.color : 'text-gray-800'}`}>{r.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>

        ) : (
          /* ── WORLD MAP VIEW ── */
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-400 flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />選擇地區探索
            </h2>

            {/* World Map */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-800" style={{ paddingBottom: '72%' }}>
              <div className="absolute inset-0">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" alt="world map" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 to-gray-950/60" />

                {/* Region pins on map */}
                {REGIONS.map(region => {
                  const got = region.fragments.filter(f => f.obtained).length
                  const tot = region.fragments.length
                  const done = got === tot
                  return (
                    <button
                      key={region.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all hover:scale-110 hover:z-10"
                      style={{ left: `${region.mapX}%`, top: `${region.mapY}%` }}
                      onClick={() => setActiveRegion(region)}
                    >
                      <div className={`relative rounded-2xl overflow-hidden w-[72px] border-2 ${done ? region.border : 'border-gray-700'} shadow-lg group-hover:shadow-xl transition-all`}>
                        <img src={region.mapBg} alt={region.name} className="w-full h-10 object-cover" />
                        <div className={`absolute inset-0 bg-gradient-to-b ${region.color} opacity-50`} />
                        <div className={`relative px-1.5 py-1 ${done ? '' : 'bg-gray-900'}`}>
                          <p className="text-white text-[10px] font-bold leading-tight truncate">{region.flag} {region.name}</p>
                          <p className={`text-[9px] ${region.accent}`}>{got}/{tot} 碎片</p>
                        </div>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 bg-gradient-to-r ${region.color}`} />
                    </button>
                  )
                })}

                {/* Map label */}
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur rounded-xl px-2.5 py-1.5">
                  <p className="text-white text-[10px] font-bold flex items-center gap-1">
                    <Globe className="h-3 w-3 text-cyan-400" />亞太藏寶地圖
                  </p>
                </div>
              </div>
            </div>

            {/* Region Cards */}
            <div className="grid grid-cols-2 gap-3">
              {REGIONS.map(region => {
                const got = region.fragments.filter(f => f.obtained).length
                const tot = region.fragments.length
                return (
                  <button
                    key={region.id}
                    onClick={() => setActiveRegion(region)}
                    className={`relative rounded-2xl overflow-hidden border-2 ${got > 0 ? region.border : 'border-gray-800'} text-left hover:scale-[1.02] transition-all`}
                  >
                    <img src={region.mapBg} alt={region.name} className="w-full h-20 object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-b ${region.color} opacity-50`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent" />
                    <div className="relative px-3 py-2.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-lg">{region.flag}</span>
                        <span className={`text-[10px] font-bold ${region.accent}`}>{got}/{tot}</span>
                      </div>
                      <p className="text-white font-bold text-sm">{region.name}</p>
                      <p className={`text-[10px] ${region.accent}`}>{region.artist}</p>
                      <div className="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${region.color} rounded-full`} style={{ width: `${(got/tot)*100}%` }} />
                      </div>
                    </div>
                    <ChevronRight className="absolute top-2 right-2 h-3.5 w-3.5 text-white/40" />
                  </button>
                )
              })}
            </div>

            {/* Rewards */}
            <h2 className="text-sm font-bold text-gray-400 flex items-center gap-2">
              <Gift className="h-4 w-4 text-pink-400" />集碎片獎勵
            </h2>
            <div className="space-y-2">
              {REWARDS.map(r => {
                const unlocked = COLLECTED >= r.threshold
                return (
                  <button
                    key={r.threshold}
                    onClick={() => unlocked && setShowReward(r)}
                    className={`w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${unlocked ? 'bg-gradient-to-r from-emerald-900/50 to-teal-900/30 border-emerald-700 hover:border-emerald-500' : 'bg-gray-900 border-gray-800'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${unlocked ? 'bg-emerald-800' : 'bg-gray-800'}`}>
                      {unlocked ? r.icon : <Lock className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold ${unlocked ? 'text-emerald-300' : 'text-gray-500'}`}>{r.title}</span>
                        <Badge className={`text-[9px] px-1.5 py-0 border ${unlocked ? 'bg-emerald-500/20 text-emerald-300 border-emerald-600/30' : 'bg-gray-800 text-gray-600 border-gray-700'}`}>
                          {r.threshold}片
                        </Badge>
                      </div>
                      <p className={`text-xs truncate ${unlocked ? 'text-white' : 'text-gray-600'}`}>{r.reward}</p>
                    </div>
                    {unlocked
                      ? <ChevronRight className="h-4 w-4 text-emerald-400 shrink-0" />
                      : <span className="text-xs text-gray-600 shrink-0">差{r.threshold - COLLECTED}片</span>}
                  </button>
                )
              })}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-gray-700 text-center">
              <div className="text-3xl mb-2"></div>
              <p className="font-bold text-white mb-1">探索亞太四大森林</p>
              <p className="text-gray-400 text-xs mb-4">購票、GPS打卡、完成任務，解鎖各地隱藏碎片</p>
              <div className="flex gap-2">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-9 text-sm" onClick={() => router.push('/events')}>
                  <Ticket className="h-4 w-4 mr-1.5" />購票獲碎片
                </Button>
                <Button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white h-9 text-sm" onClick={() => router.push('/forum')}>
                  <MessageSquare className="h-4 w-4 mr-1.5" />論壇完成任務
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fragment Detail */}
      {selectedFrag && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setSelectedFrag(null)}>
          <div className="bg-gray-900 rounded-t-3xl w-full max-w-md border-t border-gray-800 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">碎片詳情</h3>
              <button onClick={() => setSelectedFrag(null)} className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border-2 ${selectedFrag.obtained ? RARITY[selectedFrag.rarity].border : 'border-dashed border-gray-700'} bg-gray-800`}>
                {selectedFrag.obtained ? selectedFrag.emoji : ''}
              </div>
              <div>
                <p className="font-bold text-white">{selectedFrag.obtained ? selectedFrag.name : '未解鎖碎片'}</p>
                <span className={`text-sm ${RARITY[selectedFrag.rarity].color}`}>{RARITY[selectedFrag.rarity].label}</span>
                <div className="mt-1">
                  {selectedFrag.obtained
                    ? <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-600/30 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />已收集</Badge>
                    : <Badge className="bg-gray-800 text-gray-500 border-gray-700 text-xs"><Lock className="h-3 w-3 mr-1" />未解鎖</Badge>}
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-gray-500 text-xs shrink-0 mt-0.5">獲得方式</span>
                <span className="text-white text-xs">{selectedFrag.how}</span>
              </div>
              {selectedFrag.obtained && selectedFrag.date && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs shrink-0">收集日期</span>
                  <span className="text-emerald-300 text-xs font-medium">{selectedFrag.date}</span>
                </div>
              )}
            </div>
            {!selectedFrag.obtained && (() => {
              const target = resolveHowTarget(selectedFrag.how)
              return (
                <div className="space-y-2">
                  <div className="bg-gray-800 rounded-xl px-3 py-2 flex items-start gap-2">
                    <span className="text-gray-400 text-xs shrink-0 mt-0.5">獲得方式</span>
                    <span className="text-white text-xs">{selectedFrag.how}</span>
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11"
                    onClick={() => { setSelectedFrag(null); router.push(target.href) }}
                  >
                    {target.icon}立即前往獲得此碎片
                  </Button>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setShowReward(null)}>
          <div className="bg-gray-900 rounded-3xl w-full max-w-sm border border-emerald-700/50 p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-3">{showReward.icon}</div>
            <div className="flex justify-center mb-2">
              {[...Array(3)].map((_, i) => <Sparkles key={i} className="h-4 w-4 text-amber-400 mx-0.5" />)}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{showReward.title}</h3>
            <p className="text-emerald-300 text-sm mb-4">{showReward.reward}</p>
            <div className="bg-gray-800 rounded-xl p-3 mb-5 text-xs text-gray-400">
              已解鎖！前往「我的票券 → 樹資產票夾」領取
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800" onClick={() => setShowReward(null)}>關閉</Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => window.location.href='/tickets'}>
                <Gift className="h-4 w-4 mr-1.5" />領取獎勵
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
