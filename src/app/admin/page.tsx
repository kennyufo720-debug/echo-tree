'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  BarChart3, Ticket, Users, DollarSign, TrendingUp, CalendarDays, MapPin,
  CheckCircle, XCircle, Clock, Search, Filter, Eye, Edit, Plus, Save,
  Trash2, Pin, Flame, Image as ImageIcon, Palette, Home, MessageSquare,
  ShoppingBag, ChevronRight, X, Upload, RefreshCw, Star, Tag,
  ToggleLeft, ToggleRight, Globe, Sparkles, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { mockEvents, mockOrders } from '@/lib/mock-data'
import { Event } from '@/lib/types'

// ── Admin Config Types ────────────────────────────────────
interface AppearanceConfig {
  brandPrimary: string
  brandDark: string
  brandLight: string
  navBg: string
  navText: string
  heroBg: string
  heroGradFrom: string
  heroGradTo: string
  footerBg: string
  footerText: string
  cardRadius: string
  buttonRadius: string
}

interface HomepageConfig {
  heroImage: string
  heroTitle: string
  heroSubtitle: string
  heroOverlay: number
  showCountdown: boolean
  featuredEventIds: string[]
  forumSectionTitle: string
  esgSectionTitle: string
}

interface MerchItem {
  id: string
  name: string
  image: string
  points: number
  tag: string
  tagColor: string
  description: string
  stock: number
}

interface AdminState {
  appearance: AppearanceConfig
  homepage: HomepageConfig
  eventOverrides: Record<string, Partial<Event> & { themeColor?: string; accentColor?: string }>
  merchs: MerchItem[]
}

// ── Defaults ──────────────────────────────────────────────
const DEFAULT_APPEARANCE: AppearanceConfig = {
  brandPrimary: '#059669', brandDark: '#047857', brandLight: '#d1fae5',
  navBg: '#ffffff', navText: '#111827',
  heroBg: '#065f46', heroGradFrom: '#059669', heroGradTo: '#0d9488',
  footerBg: '#111827', footerText: '#9ca3af',
  cardRadius: '1rem', buttonRadius: '0.5rem',
}

const DEFAULT_HOMEPAGE: HomepageConfig = {
  heroImage: '/image-1776910203160.jpg',
  heroTitle: '音樂．永續．回音',
  heroSubtitle: '每一張票，種下一棵樹',
  heroOverlay: 0.55,
  showCountdown: true,
  featuredEventIds: ['7', '1', '2', '3'],
  forumSectionTitle: '回音論壇・熱門討論',
  esgSectionTitle: '每張票 = 一棵樹 ',
}

const DEFAULT_MERCHS: MerchItem[] = [
  { id: 'm1', name: '限定帆布袋',     image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80', points: 500,  tag: '熱門',   tagColor: '#f97316', description: '回音樹限定環保帆布袋', stock: 50 },
  { id: 'm2', name: '刺繡徽章組',     image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', points: 300,  tag: '新品',   tagColor: '#8b5cf6', description: '精緻刺繡徽章 5 入組', stock: 120 },
  { id: 'm3', name: '演唱會手環',     image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&q=80', points: 200,  tag: '限量',   tagColor: '#ec4899', description: '螢光矽膠手環', stock: 80 },
  { id: 'm4', name: 'ESG 種樹證書',   image: 'https://images.unsplash.com/photo-1542601906897-edc9b0d6be72?w=200&q=80', points: 800,  tag: 'ESG',    tagColor: '#10b981', description: '印有你名字的種樹座標證書', stock: 200 },
  { id: 'm5', name: '限定 Tee 上衣',  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80', points: 1500, tag: '限量',   tagColor: '#ec4899', description: '100% 有機棉 T-Shirt', stock: 30 },
  { id: 'm6', name: '音樂節馬克杯',   image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&q=80', points: 600,  tag: '熱門',   tagColor: '#f97316', description: '陶瓷馬克杯 350ml', stock: 60 },
  { id: 'm7', name: '折疊雨傘',       image: 'https://images.unsplash.com/photo-1558618047-3c5c3a4ed6c6?w=200&q=80', points: 1000, tag: '實用',   tagColor: '#3b82f6', description: '超輕量折疊傘，附收納袋', stock: 40 },
  { id: 'm8', name: 'PSY X ECHO 森林滅火器', image: '/psy-x-echo-extinguisher.jpg', points: 2480, tag: '聯名', tagColor: '#0ea5e9', description: 'PSY × ECHO TREE 限量聯名款森林滅火器，天空藍消光塗裝，COLLAB EDITION // MODEL: PAS-01，限量發售。', stock: 50 },
  { id: 'm9', name: 'echo tree 低碳限量T雪', image: '/echo-tree-tee-white.jpg', points: 890, tag: '限量', tagColor: '#10b981', description: 'echo tree 低碳系列限量T雪（白），100% 有機棉，深森綠字樣印刷，尺碼 S–XL，限量發售。', stock: 60 },
]

const ADMIN_KEY = 'echotree_admin_config'

function loadAdminState(): AdminState {
  if (typeof window === 'undefined') return { appearance: DEFAULT_APPEARANCE, homepage: DEFAULT_HOMEPAGE, eventOverrides: {}, merchs: DEFAULT_MERCHS }
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_KEY) ?? '{}')
    return {
      appearance:     { ...DEFAULT_APPEARANCE,  ...(saved.appearance ?? {}) },
      homepage:       { ...DEFAULT_HOMEPAGE,     ...(saved.homepage ?? {}) },
      eventOverrides: saved.eventOverrides ?? {},
      merchs:         (() => {
        if (!saved.merchs?.length) return DEFAULT_MERCHS
        const savedIds = new Set(saved.merchs.map((m: MerchItem) => m.id))
        return [...saved.merchs, ...DEFAULT_MERCHS.filter(d => !savedIds.has(d.id))]
      })(),
    }
  } catch { return { appearance: DEFAULT_APPEARANCE, homepage: DEFAULT_HOMEPAGE, eventOverrides: {}, merchs: DEFAULT_MERCHS } }
}

function saveAdminState(state: AdminState): string | null {
  try {
    // Strip oversized base64 images to URL hints before saving
    const safe: AdminState = {
      ...state,
      merchs: state.merchs.map(m => {
        // base64 strings start with "data:"; keep but warn if > 400KB each
        if (m.image?.startsWith('data:') && m.image.length > 400_000) {
          console.warn(`商品「${m.name}」圖片過大 (${Math.round(m.image.length/1024)}KB)，建議改用 URL`)
        }
        return m
      }),
    }
    localStorage.setItem(ADMIN_KEY, JSON.stringify(safe))
    return null
  } catch (e) {
    const msg = (e as Error).message ?? '未知錯誤'
    if (msg.includes('quota') || msg.includes('QuotaExceeded')) {
      return '儲存失敗：圖片檔案太大，請改用圖片 URL 替代上傳'
    }
    return `儲存失敗：${msg}`
  }
}

// ── Reusable UI helpers ───────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
        {label}
        {hint && <span className="text-gray-400 font-normal">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

function ColorField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
          />
        </div>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          maxLength={7}
        />
        <div className="w-8 h-8 rounded-lg border border-gray-200 shrink-0" style={{ background: value }} />
      </div>
    </Field>
  )
}

function ImageField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  // Sync displayed URL input with external value changes (e.g. when modal opens for different item)
  const [urlInput, setUrlInput] = useState(() => value?.startsWith('data:') ? '（已上傳）' : (value ?? ''))
  const [sizeWarn, setSizeWarn] = useState('')
  useEffect(() => {
    setUrlInput(value?.startsWith('data:') ? '（已上傳）' : (value ?? ''))
  }, [value])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Warn if file > 300 KB (becomes ~400 KB base64, risky for localStorage)
    if (file.size > 300_000) {
      setSizeWarn(`圖片 ${Math.round(file.size / 1024)} KB，建議 < 300 KB 或改用圖片 URL`)
    } else {
      setSizeWarn('')
    }
    const reader = new FileReader()
    reader.onload = () => { const r = reader.result as string; onChange(r); setUrlInput('（已上傳）') }
    reader.readAsDataURL(file)
  }

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="https://... 或上傳圖片"
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); onChange(e.target.value) }}
            className="flex-1 text-sm"
          />
          <Button type="button" size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" />上傳
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        {sizeWarn && (
          <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
            ⚠️ {sizeWarn}
          </div>
        )}
        {value && !value.startsWith('（') && (
          <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img src={value} alt="預覽" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">預覽</div>
          </div>
        )}
      </div>
    </Field>
  )
}

function SliderField({ label, value, onChange, min, max, step, format }: {
  label: string; value: number; onChange: (v: number) => void
  min: number; max: number; step: number; format?: (v: number) => string
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 accent-emerald-600"
        />
        <span className="text-sm font-mono w-12 text-right text-gray-600">
          {format ? format(value) : value}
        </span>
      </div>
    </Field>
  )
}

function SaveBar({ dirty, onSave, onReset }: { dirty: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <div className={`sticky bottom-4 z-10 mx-auto flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-lg transition-all ${dirty ? 'bg-emerald-600 text-white opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}`}>
      <span className="text-sm font-medium flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />有未儲存的變更
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 hover:text-white" onClick={onReset}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" />還原
        </Button>
        <Button size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50" onClick={onSave}>
          <Save className="h-3.5 w-3.5 mr-1" />儲存發布
        </Button>
      </div>
    </div>
  )
}

// ── Mini Charts ───────────────────────────────────────────
function SalesChart() {
  const data = [65, 80, 55, 90, 75, 100, 85, 70, 95, 60, 88, 92]
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-emerald-400 hover:bg-emerald-600 transition-colors cursor-pointer" style={{ height: `${(val / max) * 100}%` }} title={`${months[i]}: ${val}%`} />
          <span className="text-[9px] text-gray-400">{months[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ── Event Edit Panel ──────────────────────────────────────
function EventEditPanel({ event, overrides, onSave, onClose }: {
  event: Event
  overrides: Partial<Event> & { themeColor?: string; accentColor?: string }
  onSave: (overrides: Partial<Event> & { themeColor?: string; accentColor?: string }) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...event, themeColor: '#059669', accentColor: '#d1fae5', ...overrides })
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const [tagInput, setTagInput] = useState('')

  const PRESET_THEMES = [
    { name: '翠綠', from: '#059669', to: '#0d9488' },
    { name: '靛藍', from: '#4f46e5', to: '#7c3aed' },
    { name: '玫瑰', from: '#e11d48', to: '#ec4899' },
    { name: '琥珀', from: '#d97706', to: '#f59e0b' },
    { name: '深藍', from: '#1e40af', to: '#2563eb' },
    { name: '暗夜', from: '#1f2937', to: '#374151' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-xl bg-white h-full overflow-y-auto flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-gray-900">編輯活動</h2>
            <p className="text-xs text-gray-400">{event.id}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onSave(form)}>
              <Save className="h-3.5 w-3.5 mr-1" />儲存
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Preview Banner */}
        <div className="relative h-32 shrink-0 overflow-hidden">
          <img src={form.image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.opacity = '0')} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${form.themeColor}cc, ${form.accentColor}99)` }} />
          <div className="absolute inset-0 flex flex-col justify-end px-4 pb-3">
            <p className="text-white font-bold text-sm drop-shadow line-clamp-1">{form.title}</p>
            <p className="text-white/80 text-xs">{form.artist} · {form.venue}</p>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* Basic Info */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">基本資訊</p>
            <div className="space-y-3">
              <Field label="活動標題">
                <Input value={form.title} onChange={e => set('title', e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="藝人 / 主辦">
                  <Input value={form.artist} onChange={e => set('artist', e.target.value)} />
                </Field>
                <Field label="分類">
                  <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    {['concert','festival','talk','sports','others'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="場館">
                  <Input value={form.venue} onChange={e => set('venue', e.target.value)} />
                </Field>
                <Field label="城市">
                  <Input value={form.city} onChange={e => set('city', e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="日期">
                  <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                </Field>
                <Field label="時間">
                  <Input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
                </Field>
              </div>
            </div>
          </section>

          <Separator />

          {/* Image */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">封面圖片</p>
            <ImageField label="封面圖" value={form.image} onChange={v => set('image', v)} hint="建議 16:9，最小 800×450px" />
            <div className="mt-3">
              <Field label="YouTube 影片 ID" hint="用於活動頁背景">
                <Input placeholder="例：QAc2-WVUbC8" value={form.videoId ?? ''} onChange={e => set('videoId', e.target.value)} />
              </Field>
            </div>
          </section>

          <Separator />

          {/* Color Theme */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">色彩主題</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PRESET_THEMES.map(t => (
                <button key={t.name} onClick={() => { set('themeColor', t.from); set('accentColor', t.to) }}
                  className="h-10 rounded-xl text-white text-xs font-medium transition-all hover:scale-105 border-2 border-transparent"
                  style={{ background: `linear-gradient(135deg,${t.from},${t.to})`, borderColor: form.themeColor === t.from ? '#fff' : 'transparent', boxShadow: form.themeColor === t.from ? '0 0 0 2px ' + t.from : 'none' }}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="主色" value={form.themeColor ?? '#059669'} onChange={v => set('themeColor', v)} />
              <ColorField label="輔色" value={form.accentColor ?? '#d1fae5'} onChange={v => set('accentColor', v)} />
            </div>
          </section>

          <Separator />

          {/* Pricing & Seats */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">票價 & 座位</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="最低票價 (NT$)">
                <Input type="number" value={form.priceFrom} onChange={e => set('priceFrom', Number(e.target.value))} />
              </Field>
              <Field label="最高票價 (NT$)">
                <Input type="number" value={form.priceTo} onChange={e => set('priceTo', Number(e.target.value))} />
              </Field>
              <Field label="總座位數">
                <Input type="number" value={form.totalSeats} onChange={e => set('totalSeats', Number(e.target.value))} />
              </Field>
              <Field label="剩餘座位數">
                <Input type="number" value={form.availableSeats} onChange={e => set('availableSeats', Number(e.target.value))} />
              </Field>
            </div>
          </section>

          <Separator />

          {/* Status & Tags */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">狀態 & 標籤</p>
            <Field label="銷售狀態">
              <div className="flex gap-2">
                {(['on-sale','sold-out','coming-soon'] as const).map(s => (
                  <button key={s} onClick={() => set('status', s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      form.status === s ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    { s === 'on-sale' ? '銷售中' : s === 'sold-out' ? '已售完' : '即將開賣' }
                  </button>
                ))}
              </div>
            </Field>
            <div className="mt-3">
              <Field label="標籤">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {tag}
                      <button onClick={() => set('tags', form.tags.filter(t => t !== tag))} className="hover:text-red-500"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="新增標籤..." value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { set('tags', [...form.tags, tagInput.trim()]); setTagInput('') }}}
                    className="text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => { if (tagInput.trim()) { set('tags', [...form.tags, tagInput.trim()]); setTagInput('') }}}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Field>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// ── Merch Edit Modal ──────────────────────────────────────
function MerchEditModal({ item, onSave, onClose }: { item: MerchItem; onSave: (item: MerchItem) => void; onClose: () => void }) {
  const [form, setForm] = useState(item)
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const TAG_COLORS = ['#f97316','#8b5cf6','#ec4899','#10b981','#3b82f6','#ef4444','#f59e0b','#6366f1']
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold">編輯商品</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <ImageField label="商品圖片" value={form.image} onChange={v => set('image', v)} />
          <Field label="商品名稱"><Input value={form.name} onChange={e => set('name', e.target.value)} /></Field>
          <Field label="說明"><Input value={form.description} onChange={e => set('description', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="售價 (NT$)"><Input type="number" value={form.points} onChange={e => set('points', Number(e.target.value))} /></Field>
            <Field label="庫存"><Input type="number" value={form.stock} onChange={e => set('stock', Number(e.target.value))} /></Field>
          </div>
          <Field label="標籤文字"><Input value={form.tag} onChange={e => set('tag', e.target.value)} /></Field>
          <Field label="標籤顏色">
            <div className="flex items-center gap-2 flex-wrap">
              {TAG_COLORS.map(c => (
                <button key={c} onClick={() => set('tagColor', c)}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110"
                  style={{ background: c, outline: form.tagColor === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }}
                />
              ))}
              <input type="color" value={form.tagColor} onChange={e => set('tagColor', e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border-0 p-0" />
            </div>
          </Field>
        </div>
        <div className="flex gap-3 p-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>取消</Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onSave(form)}>
            <Save className="h-3.5 w-3.5 mr-1" />儲存
          </Button>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// Main Admin Page
// ═════════════════════════════════════════════════════════
const ADMIN_PIN = 'echo2026'  // BUG-06: simple PIN gate for the hidden admin route

// BUG-06 fix: PIN gate component (separate so hooks aren't called conditionally)
function AdminPinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const check = () => {
    if (pinInput === ADMIN_PIN) onUnlock()
    else { setPinError(true); setPinInput('') }
  }
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-800">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌳</span>
          </div>
          <h2 className="text-xl font-bold text-white">後台管理</h2>
          <p className="text-gray-500 text-sm mt-1">請輸入管理員密碼</p>
        </div>
        <input
          type="password"
          placeholder="密碼"
          className={`w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none border ${pinError ? 'border-red-500' : 'border-gray-700'} focus:border-emerald-500 mb-3`}
          value={pinInput}
          onChange={e => { setPinInput(e.target.value); setPinError(false) }}
          onKeyDown={e => e.key === 'Enter' && check()}
          autoFocus
        />
        {pinError && <p className="text-red-400 text-xs mb-3">密碼錯誤</p>}
        <button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-sm font-medium transition-colors"
          onClick={check}
        >
          進入後台
        </button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [adminState, setAdminState] = useState<AdminState>({ appearance: DEFAULT_APPEARANCE, homepage: DEFAULT_HOMEPAGE, eventOverrides: {}, merchs: DEFAULT_MERCHS })
  const [savedState, setSavedState] = useState<AdminState | null>(null)
  const [dirty, setDirty] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingMerch, setEditingMerch] = useState<MerchItem | null>(null)
  const [orderSearch, setOrderSearch] = useState('')
  const [eventSearch, setEventSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [forumPosts, setForumPosts] = useState<{ id: string; title: string; author: string; category: string; createdAt: string; pinned?: boolean; hot?: boolean }[]>([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    const s = loadAdminState()
    setAdminState(s)
    setSavedState(s)
    // Load forum posts
    try {
      const stored = JSON.parse(localStorage.getItem('echotree_forum') ?? '[]')
      setForumPosts(stored)
    } catch {}
  }, [])

  function update(fn: (prev: AdminState) => AdminState) {
    setAdminState(prev => { const next = fn(prev); setDirty(true); return next })
  }
  function setAppearance(k: keyof AppearanceConfig, v: string) {
    update(s => ({ ...s, appearance: { ...s.appearance, [k]: v } }))
  }
  function setHomepage(k: keyof HomepageConfig, v: unknown) {
    update(s => ({ ...s, homepage: { ...s.homepage, [k]: v } }))
  }

  function handleSave() {
    const err = saveAdminState(adminState)
    if (err) {
      setToast('⚠️ ' + err)
      setTimeout(() => setToast(''), 5000)
      return
    }
    setSavedState(adminState)
    setDirty(false)
    setToast(' 已儲存並發布！')
    setTimeout(() => setToast(''), 2500)
  }

  function handleAddMerch() {
    const newItem: MerchItem = {
      id: `m_${Date.now()}`,
      name: '新商品',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80',
      points: 500,
      tag: '新品',
      tagColor: '#8b5cf6',
      description: '商品說明',
      stock: 50,
    }
    update(s => ({ ...s, merchs: [...s.merchs, newItem] }))
    setEditingMerch(newItem)
  }
  function handleReset() {
    if (savedState) { setAdminState(savedState); setDirty(false) }
  }

  // Merge events with overrides
  const mergedEvents = mockEvents.map(e => ({ ...e, ...(adminState.eventOverrides[e.id] ?? {}) }))

  const filteredOrders = mockOrders.filter(o =>
    !orderSearch || o.eventTitle.includes(orderSearch) || o.id.includes(orderSearch)
  )
  const filteredEvents = mergedEvents.filter(e =>
    !eventSearch || e.title.includes(eventSearch) || e.artist.includes(eventSearch)
  )

  const stats = [
    { label: '總銷售額',  value: 'NT$ 2,450,000', icon: DollarSign, change: '+12.5%', color: 'bg-emerald-50 text-emerald-600' },
    { label: '已售票數',  value: '8,432',           icon: Ticket,     change: '+8.2%',  color: 'bg-blue-50 text-blue-600' },
    { label: '活躍用戶',  value: '5,218',           icon: Users,      change: '+15.1%', color: 'bg-violet-50 text-violet-600' },
    { label: '本月活動',  value: '14',              icon: CalendarDays, change: '+2',   color: 'bg-orange-50 text-orange-600' },
  ]

  const MOCK_USERS = [
    { name: '王小明', phone: '0912***456', verified: true,  orders: 3, joined: '2025-01-15', points: 1200 },
    { name: '李美玲', phone: '0928***789', verified: true,  orders: 7, joined: '2025-02-08', points: 3400 },
    { name: '陳志偉', phone: '0955***321', verified: false, orders: 1, joined: '2025-04-18', points: 200  },
    { name: '張雅婷', phone: '0933***654', verified: true,  orders: 5, joined: '2025-03-22', points: 2100 },
    { name: '林大地',  phone: '0966***987', verified: true,  orders: 12, joined: '2024-11-01', points: 8900 },
    { name: '黃子晴', phone: '0978***123', verified: false, orders: 0, joined: '2026-04-27', points: 50   },
  ].filter(u => !userSearch || u.name.includes(userSearch) || u.phone.includes(userSearch))

  // BUG-06: show PIN gate until unlocked
  if (!unlocked) return <AdminPinGate onUnlock={() => setUnlocked(true)} />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理後台</h1>
          <p className="text-gray-400 text-sm">回音樹 Echo Tree · CMS</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <Badge className="bg-amber-100 text-amber-700 border border-amber-200">有未儲存變更</Badge>}
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={handleSave}>
            <Save className="h-4 w-4" />儲存發布
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-5 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"  className="gap-1"><BarChart3 className="h-3.5 w-3.5" />總覽</TabsTrigger>
          <TabsTrigger value="events"    className="gap-1"><CalendarDays className="h-3.5 w-3.5" />活動管理</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1"><Palette className="h-3.5 w-3.5" />外觀設定</TabsTrigger>
          <TabsTrigger value="homepage"  className="gap-1"><Home className="h-3.5 w-3.5" />首頁設定</TabsTrigger>
          <TabsTrigger value="merch"     className="gap-1"><ShoppingBag className="h-3.5 w-3.5" />商城管理</TabsTrigger>
          <TabsTrigger value="forum"     className="gap-1"><MessageSquare className="h-3.5 w-3.5" />論壇管理</TabsTrigger>
          <TabsTrigger value="users"     className="gap-1"><Users className="h-3.5 w-3.5" />用戶</TabsTrigger>
          <TabsTrigger value="orders"    className="gap-1"><Ticket className="h-3.5 w-3.5" />訂單</TabsTrigger>
        </TabsList>

        {/* ── 總覽 ─────────────────────────────────────────── */}
        <TabsContent value="overview">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(stat => (
              <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                    <Badge className="bg-green-50 text-green-600 text-xs border-0">{stat.change}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-600" />2026 銷售趨勢</CardTitle>
              </CardHeader>
              <CardContent><SalesChart /></CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" />熱門活動</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mergedEvents.slice(0, 4).map((event, i) => {
                  const pct = Math.round((1 - event.availableSeats / event.totalSeats) * 100)
                  return (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="h-1.5 flex-1 bg-gray-100 rounded-full">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── 活動管理 ─────────────────────────────────────── */}
        <TabsContent value="events">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="搜尋活動、藝人..." className="pl-9" value={eventSearch} onChange={e => setEventSearch(e.target.value)} />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                  <Plus className="h-4 w-4 mr-1" />新增活動
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEvents.map(event => {
                  const soldPct = Math.round((1 - event.availableSeats / event.totalSeats) * 100)
                  const ov = adminState.eventOverrides[event.id] ?? {}
                  const theme = (ov as { themeColor?: string }).themeColor ?? '#059669'
                  return (
                    <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                      {/* Color bar */}
                      <div className="w-1 h-14 rounded-full shrink-0" style={{ background: theme }} />
                      <div className="relative shrink-0">
                        <img src={event.image} alt={event.title} className="w-14 h-14 rounded-xl object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate text-sm">{event.title}</p>
                          <Badge className={`text-xs shrink-0 ${
                            event.status === 'on-sale' ? 'bg-green-50 text-green-600 border border-green-200' :
                            event.status === 'sold-out' ? 'bg-gray-100 text-gray-500' :
                            'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}>
                            {event.status === 'on-sale' ? '銷售中' : event.status === 'sold-out' ? '已售完' : '即將開賣'}
                          </Badge>
                          {Object.keys(ov).length > 0 && <Badge className="bg-amber-50 text-amber-600 border border-amber-200 text-xs">已編輯</Badge>}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-0.5"><CalendarDays className="h-3 w-3" />{event.date}</span>
                          <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="h-1.5 flex-1 bg-gray-100 rounded-full max-w-32">
                            <div className="h-full rounded-full transition-all" style={{ width: `${soldPct}%`, background: theme }} />
                          </div>
                          <span className="text-xs text-gray-400">已售 {soldPct}%</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm" style={{ color: theme }}>NT$ {event.priceFrom.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">起</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => setEditingEvent(mockEvents.find(e => e.id === event.id) ?? event)}>
                        <Edit className="h-3.5 w-3.5" />編輯
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 外觀設定 ─────────────────────────────────────── */}
        <TabsContent value="appearance">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Brand Colors */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4 text-emerald-600" />品牌色彩</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap mb-2">
                  {[
                    { name: '翠綠（預設）', primary: '#059669', dark: '#047857', light: '#d1fae5' },
                    { name: '深海藍',       primary: '#2563eb', dark: '#1d4ed8', light: '#dbeafe' },
                    { name: '日落橘',       primary: '#ea580c', dark: '#c2410c', light: '#ffedd5' },
                    { name: '暗夜紫',       primary: '#7c3aed', dark: '#6d28d9', light: '#ede9fe' },
                    { name: '玫瑰紅',       primary: '#e11d48', dark: '#be123c', light: '#ffe4e6' },
                  ].map(t => (
                    <button key={t.name}
                      onClick={() => { setAppearance('brandPrimary', t.primary); setAppearance('brandDark', t.dark); setAppearance('brandLight', t.light) }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all hover:scale-105"
                      style={{ background: t.primary, outline: adminState.appearance.brandPrimary === t.primary ? `3px solid ${t.primary}` : 'none', outlineOffset: 2 }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                <ColorField label="主色" value={adminState.appearance.brandPrimary} onChange={v => setAppearance('brandPrimary', v)} hint="按鈕、連結、強調" />
                <ColorField label="深色版" value={adminState.appearance.brandDark} onChange={v => setAppearance('brandDark', v)} hint="hover 狀態" />
                <ColorField label="淺色版" value={adminState.appearance.brandLight} onChange={v => setAppearance('brandLight', v)} hint="背景底色" />
              </CardContent>
            </Card>

            {/* Navbar */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-600" />導覽列</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview */}
                <div className="rounded-xl overflow-hidden border border-gray-200 mb-2">
                  <div className="h-12 flex items-center px-4 gap-3 text-sm" style={{ background: adminState.appearance.navBg, color: adminState.appearance.navText }}>
                    <span className="font-bold text-base"></span>
                    <span className="font-semibold">回音樹</span>
                    <div className="ml-auto flex gap-3 text-xs opacity-70">
                      <span>活動</span><span>論壇</span><span>藏寶圖</span>
                    </div>
                  </div>
                </div>
                <ColorField label="背景色" value={adminState.appearance.navBg} onChange={v => setAppearance('navBg', v)} />
                <ColorField label="文字色" value={adminState.appearance.navText} onChange={v => setAppearance('navText', v)} />
              </CardContent>
            </Card>

            {/* Hero Gradient */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-600" />英雄區漸層</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-16 rounded-xl" style={{ background: `linear-gradient(135deg, ${adminState.appearance.heroGradFrom}, ${adminState.appearance.heroGradTo})` }} />
                <ColorField label="漸層起始色" value={adminState.appearance.heroGradFrom} onChange={v => setAppearance('heroGradFrom', v)} />
                <ColorField label="漸層結束色" value={adminState.appearance.heroGradTo} onChange={v => setAppearance('heroGradTo', v)} />
              </CardContent>
            </Card>

            {/* Footer */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Home className="h-4 w-4 text-emerald-600" />頁尾</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-16 rounded-xl flex items-center px-4" style={{ background: adminState.appearance.footerBg }}>
                  <span className="text-xs" style={{ color: adminState.appearance.footerText }}>© 2026 回音樹 Echo Tree · All rights reserved</span>
                </div>
                <ColorField label="背景色" value={adminState.appearance.footerBg} onChange={v => setAppearance('footerBg', v)} />
                <ColorField label="文字色" value={adminState.appearance.footerText} onChange={v => setAppearance('footerText', v)} />
              </CardContent>
            </Card>

            {/* Border Radius */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">圓角樣式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <SliderField label="卡片圓角" value={parseFloat(adminState.appearance.cardRadius)} onChange={v => setAppearance('cardRadius', v + 'rem')} min={0} max={2} step={0.125} format={v => v + 'rem'} />
                    <div className="mt-3 h-16 bg-emerald-100 flex items-center justify-center text-sm text-emerald-700 font-medium" style={{ borderRadius: adminState.appearance.cardRadius }}>
                      卡片預覽
                    </div>
                  </div>
                  <div>
                    <SliderField label="按鈕圓角" value={parseFloat(adminState.appearance.buttonRadius)} onChange={v => setAppearance('buttonRadius', v + 'rem')} min={0} max={2} step={0.125} format={v => v + 'rem'} />
                    <div className="mt-3 flex justify-center">
                      <div className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium" style={{ borderRadius: adminState.appearance.buttonRadius }}>
                        按鈕預覽
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <SaveBar dirty={dirty} onSave={handleSave} onReset={handleReset} />
        </TabsContent>

        {/* ── 首頁設定 ─────────────────────────────────────── */}
        <TabsContent value="homepage">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Hero Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4 text-emerald-600" />英雄區塊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview */}
                <div className="relative h-32 rounded-xl overflow-hidden">
                  {adminState.homepage.heroImage && <img src={adminState.homepage.heroImage} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${adminState.appearance.heroGradFrom}${Math.round(adminState.homepage.heroOverlay * 255).toString(16).padStart(2, '0')}, ${adminState.appearance.heroGradTo}${Math.round(adminState.homepage.heroOverlay * 255).toString(16).padStart(2, '0')})` }} />
                  <div className="absolute inset-0 flex flex-col justify-center px-5">
                    <p className="text-white font-bold text-lg drop-shadow">{adminState.homepage.heroTitle}</p>
                    <p className="text-white/80 text-sm">{adminState.homepage.heroSubtitle}</p>
                  </div>
                </div>
                <ImageField label="背景圖片" value={adminState.homepage.heroImage} onChange={v => setHomepage('heroImage', v)} hint="建議 1920×1080" />
                <Field label="標題">
                  <Input value={adminState.homepage.heroTitle} onChange={e => setHomepage('heroTitle', e.target.value)} />
                </Field>
                <Field label="副標題">
                  <Input value={adminState.homepage.heroSubtitle} onChange={e => setHomepage('heroSubtitle', e.target.value)} />
                </Field>
                <SliderField label="遮罩透明度" value={adminState.homepage.heroOverlay} onChange={v => setHomepage('heroOverlay', v)} min={0} max={1} step={0.05} format={v => Math.round(v * 100) + '%'} />
                <Field label="功能開關">
                  <button
                    onClick={() => setHomepage('showCountdown', !adminState.homepage.showCountdown)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${adminState.homepage.showCountdown ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                  >
                    {adminState.homepage.showCountdown ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    顯示倒計時
                  </button>
                </Field>
              </CardContent>
            </Card>

            {/* Featured Events + Text */}
            <div className="space-y-5">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-emerald-600" />首頁精選活動</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-400 mb-3">選擇在首頁顯示的活動（勾選最多 6 個）</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {mockEvents.map(e => {
                      const selected = adminState.homepage.featuredEventIds.includes(e.id)
                      return (
                        <label key={e.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${selected ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                          <input type="checkbox" checked={selected} onChange={() => {
                            const ids = adminState.homepage.featuredEventIds
                            if (selected) setHomepage('featuredEventIds', ids.filter(id => id !== e.id))
                            else if (ids.length < 6) setHomepage('featuredEventIds', [...ids, e.id])
                          }} className="accent-emerald-600" />
                          <img src={e.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          <span className="text-sm truncate flex-1">{e.title}</span>
                          {selected && <ChevronRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                        </label>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4 text-emerald-600" />區塊標題文字</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Field label="論壇區塊標題">
                    <Input value={adminState.homepage.forumSectionTitle} onChange={e => setHomepage('forumSectionTitle', e.target.value)} />
                  </Field>
                  <Field label="ESG 區塊標題">
                    <Input value={adminState.homepage.esgSectionTitle} onChange={e => setHomepage('esgSectionTitle', e.target.value)} />
                  </Field>
                </CardContent>
              </Card>
            </div>
          </div>
          <SaveBar dirty={dirty} onSave={handleSave} onReset={handleReset} />
        </TabsContent>

        {/* ── 商城管理 ─────────────────────────────────────── */}
        <TabsContent value="merch">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-emerald-600" />點數商城商品</CardTitle>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={handleAddMerch}>
                  <Plus className="h-3.5 w-3.5" />新增商品
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {adminState.merchs.map(item => (
                  <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-32 bg-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: item.tagColor }}>{item.tag}</span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={() => setEditingMerch(item)} className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-sm">
                          <Edit className="h-3 w-3 text-gray-600" />
                        </button>
                        <button onClick={() => update(s => ({ ...s, merchs: s.merchs.filter(m => m.id !== item.id) }))} className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-sm hover:text-red-500">
                          <Trash2 className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-emerald-600"> {item.points.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">庫存 {item.stock}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <SaveBar dirty={dirty} onSave={handleSave} onReset={handleReset} />
        </TabsContent>

        {/* ── 論壇管理 ─────────────────────────────────────── */}
        <TabsContent value="forum">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                論壇文章管理
                <Badge className="bg-gray-100 text-gray-600 border-0 ml-1">{forumPosts.length} 篇用戶投稿</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {forumPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">還沒有用戶投稿的文章</p>
                  <p className="text-xs mt-1">Mock 文章在前台顯示，此處管理用戶新增的文章</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {forumPosts.map((post: typeof forumPosts[0]) => (
                    <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {post.pinned && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">置頂</span>}
                          {post.hot && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">熱門</span>}
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{post.category}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400">{post.author} · {post.createdAt}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600"
                          title="置頂/取消置頂"
                          onClick={() => {
                            const updated = forumPosts.map(p => p.id === post.id ? { ...p, pinned: !p.pinned } : p)
                            setForumPosts(updated)
                            localStorage.setItem('echotree_forum', JSON.stringify(updated))
                          }}>
                          <Pin className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                          title="刪除"
                          onClick={() => {
                            const updated = forumPosts.filter(p => p.id !== post.id)
                            setForumPosts(updated)
                            localStorage.setItem('echotree_forum', JSON.stringify(updated))
                          }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 用戶管理 ─────────────────────────────────────── */}
        <TabsContent value="users">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="搜尋姓名、電話..." className="pl-9" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: '已驗證', value: '4,821', color: 'text-green-600', bg: 'bg-green-50' },
                  { label: '待驗證', value: '397',   color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  { label: '今日新增', value: '124', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(item => (
                  <div key={item.label} className={`text-center p-4 ${item.bg} rounded-xl`}>
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              <Separator className="mb-4" />
              <div className="space-y-2">
                {MOCK_USERS.map((user, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 shrink-0">
                      {user.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{user.name}</span>
                        {user.verified
                          ? <Badge className="bg-green-50 text-green-600 border border-green-200 text-xs">已驗證</Badge>
                          : <Badge className="bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs">待驗證</Badge>}
                      </div>
                      <p className="text-xs text-gray-400">{user.phone} · 加入 {user.joined}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500 shrink-0">
                      <p className="font-medium">{user.orders} 筆訂單</p>
                      <p className="text-emerald-600"> {user.points.toLocaleString()}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs text-gray-400 hover:text-gray-600 shrink-0">管理</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 訂單管理 ─────────────────────────────────────── */}
        <TabsContent value="orders">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="搜尋訂單、活動..." className="pl-9" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                </div>
                <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />篩選</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b text-xs">
                      <th className="pb-3 pr-4 font-semibold">訂單編號</th>
                      <th className="pb-3 pr-4 font-semibold">活動</th>
                      <th className="pb-3 pr-4 font-semibold">票券碼</th>
                      <th className="pb-3 pr-4 font-semibold">金額</th>
                      <th className="pb-3 pr-4 font-semibold">狀態</th>
                      <th className="pb-3 font-semibold">時間</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">沒有符合的訂單</td></tr>
                    ) : filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs text-gray-500">{order.id}</td>
                        <td className="py-3 pr-4 text-gray-700 max-w-40 truncate text-xs">{order.eventTitle}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-emerald-600">{order.ticketCode}</td>
                        <td className="py-3 pr-4 font-semibold text-sm">NT$ {order.totalAmount.toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          {order.status === 'paid' ? (
                            <Badge className="bg-green-50 text-green-600 border border-green-200 text-xs"><CheckCircle className="h-3 w-3 mr-1" />已付款</Badge>
                          ) : order.status === 'pending' ? (
                            <Badge className="bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs"><Clock className="h-3 w-3 mr-1" />待付款</Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-600 border border-red-200 text-xs"><XCircle className="h-3 w-3 mr-1" />已取消</Badge>
                          )}
                        </td>
                        <td className="py-3 text-gray-400 text-xs">{order.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Edit Panel */}
      {editingEvent && (
        <EventEditPanel
          event={editingEvent}
          overrides={adminState.eventOverrides[editingEvent.id] ?? {}}
          onSave={overrides => {
            update(s => ({ ...s, eventOverrides: { ...s.eventOverrides, [editingEvent.id]: overrides } }))
            setEditingEvent(null)
          }}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {/* Merch Edit Modal */}
      {editingMerch && (
        <MerchEditModal
          item={editingMerch}
          onSave={updated => {
            update(s => ({ ...s, merchs: s.merchs.map(m => m.id === updated.id ? updated : m) }))
            setEditingMerch(null)
          }}
          onClose={() => setEditingMerch(null)}
        />
      )}
    </div>
  )
}
