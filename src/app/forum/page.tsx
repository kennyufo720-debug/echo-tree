'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MessageSquare, Heart, Eye, Pin, Flame, Clock, Search, Plus, ImageIcon, Video, X, AlertCircle, TrendingUp, Users, Bookmark } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser, setSessionVideo } from '@/lib/store'

// ── Types ──────────────────────────────────────────────
export interface ForumPost {
  id: string
  category: string
  title: string
  body: string
  author: string
  avatar: string
  createdAt: string
  replies: number
  likes: number
  views: number
  pinned?: boolean
  hot?: boolean
  tags: string[]
  eventId?: string
  images?: string[]   // base64 DataURLs (persisted in localStorage)
  video?: string      // Object URL (session-only, not persisted)
  videoName?: string  // filename for display
}

// ── Mock Data ──────────────────────────────────────────
export const MOCK_POSTS: ForumPost[] = [
  {
    id: 'p1', category: 'event',
    title: 'PSY 濕身演唱會 — 強烈建議帶換洗衣物！！',
    body: '上次首爾場的粉絲說會真的噴水，台北場估計更誇張，大家準備好了嗎  我打算帶防水袋裝手機',
    author: '濕身小王子', avatar: '', createdAt: '2026-04-26', replies: 87, likes: 234, views: 1820, pinned: true, hot: true,
    tags: ['PSY', '濕身', '裝備攻略'], eventId: '7',
  },
  {
    id: 'p2', category: 'ticket',
    title: '【轉讓】回音樹 ESG 音樂節 A區 2張，原價售出',
    body: '因臨時出差無法出席，A 區 C 排 12、13 號，原價 NT$2800 x2，要的私訊我',
    author: '葉子涵', avatar: '', createdAt: '2026-04-25', replies: 23, likes: 12, views: 445,
    tags: ['轉讓', '回音樹', 'A區'], eventId: '1',
  },
  {
    id: 'p3', category: 'fan',
    title: '回音森林名人堂第一名達成！分享種樹心得 ',
    body: '歷時 8 個月，終於累積到 48 棵樹！從去年周杰倫演唱會開始的第一棵，到現在看著森林地圖上自己的名字真的很感動',
    author: '林大地', avatar: '', createdAt: '2026-04-24', replies: 156, likes: 512, views: 3200, hot: true,
    tags: ['名人堂', '種樹', 'ESG', '心得'],
  },
  {
    id: 'p4', category: 'event',
    title: 'BLACKPINK 高雄巨蛋 — 場地位置比較心得',
    body: 'B區後段其實視野比想像好！音效在巨蛋有點迴音，建議帶耳塞，另外交通記得提早 2 小時',
    author: '黑粉Lisa控', avatar: '', createdAt: '2026-04-23', replies: 45, likes: 89, views: 1204,
    tags: ['BLACKPINK', '高雄巨蛋', '心得'], eventId: '2',
  },
  {
    id: 'p5', category: 'esg',
    title: '每買一張票就種一棵樹 — Echo Tree ESG 機制超詳細解說',
    body: 'ESG 音樂節每張票都對應到真實種樹座標，我去實地考察了南投仁愛鄉的周杰倫森林，分享照片給大家看！',
    author: 'ESG研究員', avatar: '', createdAt: '2026-04-22', replies: 203, likes: 678, views: 5640, hot: true,
    tags: ['ESG', '種樹', '永續', '碳匯'],
  },
  {
    id: 'p6', category: 'ticket',
    title: '購票系統使用心得 + 選位小技巧整理',
    body: 'VIP 區要快！開賣後 30 秒就沒了。A 區建議選 D、E 排靠中間，視線最好。點數兌換的早鳥購票資格真的超值',
    author: '資深票務達人', avatar: '', createdAt: '2026-04-21', replies: 67, likes: 145, views: 2890,
    tags: ['購票技巧', '選位', '點數'],
  },
  {
    id: 'p7', category: 'fan',
    title: '草東沒有派對台中場 — 現場實錄分享（含影片）',
    body: '第一首〈大風吹〉從頭站到尾！台中洲際音效比預期還好，附上我拍的現場影片連結',
    author: '草東鐵粉', avatar: '', createdAt: '2026-04-20', replies: 134, likes: 389, views: 4120,
    tags: ['草東', '台中', '現場實錄'], eventId: '3',
  },
  {
    id: 'p8', category: 'esg',
    title: '藏寶圖碎片收集攻略 — 台北系列 9/9 達成！',
    body: '森之呼吸 09 號傳說碎片是最難的，必須集齊 01-08 才能解鎖，我的攻略路線在這裡…',
    author: '碎片獵人', avatar: '', createdAt: '2026-04-19', replies: 91, likes: 267, views: 1880,
    tags: ['藏寶圖', '碎片', '攻略'],
  },
  {
    id: 'p9', category: 'social',
    title: '【揪團】PSY 濕身演唱會 4/5 大巨蛋 — 找同伴一起去！',
    body: '我一個人買了兩張票，朋友臨時不能去，想找同樣一個人的朋友一起入場！座位 F 區中間排，喜歡 PSY 的朋友歡迎留言  活動後可以一起去附近吃宵夜',
    author: '喜歡PSY的小美', avatar: '', createdAt: '2026-04-26', replies: 34, likes: 67, views: 892, hot: true,
    tags: ['PSY', '揪團', '大巨蛋', 'F區'], eventId: '7',
  },
  {
    id: 'p10', category: 'social',
    title: '徵：和我一起收集子瑜藏寶圖碎片的夥伴 ',
    body: '目前缺 04、07、08 號碎片，聽說這三片需要到現場活動才能拿到。有沒有人也在收集？可以一起安排場次、互相幫忙打卡！台北、桃園都可以',
    author: '碎片收集狂', avatar: '', createdAt: '2026-04-25', replies: 19, likes: 41, views: 534,
    tags: ['藏寶圖', '子瑜', '揪伴', '碎片'],
  },
  {
    id: 'p11', category: 'social',
    title: '【交友】同為草東老粉，想認識同世代的演唱會朋友',
    body: '從草東 2017 年開始追，現在身邊朋友都不聽獨立音樂了  想找同樣熱愛草東、茄子蛋、傷心欲絕的朋友！台中人優先，也歡迎跨縣市交流',
    author: '台中草東粉', avatar: '', createdAt: '2026-04-24', replies: 56, likes: 123, views: 1450,
    tags: ['草東', '獨立音樂', '交友', '台中'], eventId: '3',
  },
  {
    id: 'p12', category: 'social',
    title: '回音樹粉絲見面會 — 自發揪團，5/10 台北咖啡廳',
    body: '想在 BLACKPINK 演唱會前辦個非官方粉絲見面會！地點初步規劃在大安區咖啡廳，時間下午 2-5 點，分享應援物、一起準備燈牌！有興趣的填表單 ',
    author: '回音小樹苗', avatar: '', createdAt: '2026-04-23', replies: 88, likes: 215, views: 2100, hot: true,
    tags: ['見面會', 'BLACKPINK', '粉絲', '台北'], eventId: '2',
  },
  {
    id: 'p13', category: 'treasure',
    title: '【攻略總整理】台北系列碎片 01–09 全解鎖路線圖',
    body: '花了三個月終於把台北全系列收齊！整理了每塊碎片的取得條件、最省時的路線順序，還有哪幾片可以同一天一起拿。傳說 09 號需要前八片集齊才能解鎖，要特別注意順序！',
    author: '碎片獵人', avatar: '', createdAt: '2026-04-26', replies: 112, likes: 389, views: 4780, pinned: true, hot: true,
    tags: ['攻略', '台北系列', '全收集', '路線'],
  },
  {
    id: 'p14', category: 'treasure',
    title: '子瑜「森之呼吸」碎片怎麼拿？完整條件說明',
    body: '很多人問 05 號森之呼吸碎片的條件。答案是：在論壇發一篇帶 #子瑜 標籤的心得文，並獲得 10 個讚以上就可以解鎖！我試過了，大約 2 天內會出現在藏寶圖上。',
    author: '子瑜應援團長', avatar: '', createdAt: '2026-04-25', replies: 67, likes: 201, views: 2950, hot: true,
    tags: ['子瑜', '森之呼吸', '05號', '解鎖條件'],
  },
  {
    id: 'p15', category: 'treasure',
    title: '高雄系列碎片 Q&A — 常見問題整理',
    body: '整理最近論壇上高雄系列的高頻問題：\n① 02 號需要實體打卡還是線上？→ 線上就可以\n② GPS 精度要求多高？→ 100 公尺內即可\n③ 一天能拿幾片？→ 目前測試最多 2 片',
    author: '高雄在地導覽', avatar: '', createdAt: '2026-04-24', replies: 43, likes: 98, views: 1620,
    tags: ['高雄系列', 'Q&A', 'GPS打卡'],
  },
  {
    id: 'p16', category: 'treasure',
    title: '傳說碎片「迴響之源」出現了！條件超難，有人解開嗎？',
    body: '剛剛發現藏寶圖多了一塊金色邊框的傳說碎片「迴響之源」，獲得條件寫著「參與超過 5 場演唱會並完成所有系列碎片」。有沒有人已經達成？快來分享！',
    author: '傳說探索者', avatar: '', createdAt: '2026-04-23', replies: 156, likes: 512, views: 6840, hot: true,
    tags: ['傳說碎片', '迴響之源', '金色', '限定'],
  },
  {
    id: 'p17', category: 'treasure',
    title: '碎片交換板 — 我有台北 03，求台北 06、07',
    body: '目前手上有台北 03「月光碎影」的重複，想跟有 06 或 07 的朋友交換。碎片交換機制目前只能透過私訊對方帳號，我的帳號是 echo_hunter_tw，歡迎來找我！',
    author: 'echo_hunter', avatar: '', createdAt: '2026-04-22', replies: 29, likes: 55, views: 890,
    tags: ['碎片交換', '台北', '03號', '06號'],
  },
  {
    id: 'p18', category: 'treasure',
    title: '每日簽到也能集碎片？回音樹隱藏機制大公開',
    body: '發現一個沒人說的機制：連續簽到 7 天會隨機掉落一個「迷途碎片」，機率大概 30%。雖然不是特定系列的碎片，但可以用來兌換 200 點數！附上我的截圖證明',
    author: '回音研究院', avatar: '', createdAt: '2026-04-21', replies: 234, likes: 678, views: 8920, hot: true,
    tags: ['簽到', '隱藏機制', '迷途碎片', '點數'],
  },
]

const CATEGORIES = [
  { id: 'all',    label: '全部',    icon: '', color: 'bg-gray-100 text-gray-600' },
  { id: 'event',  label: '活動討論', icon: '', color: 'bg-emerald-50 text-emerald-700' },
  { id: 'ticket', label: '票券交流', icon: '', color: 'bg-blue-50 text-blue-700' },
  { id: 'fan',    label: '粉絲心得', icon: '', color: 'bg-pink-50 text-pink-700' },
  { id: 'esg',    label: 'ESG 行動', icon: '', color: 'bg-green-50 text-green-700' },
  { id: 'social',   label: '揪人交友', icon: '', color: 'bg-orange-50 text-orange-600' },
  { id: 'treasure', label: '藏寶圖',   icon: '', color: 'bg-yellow-50 text-yellow-700' },
]

const SORT_OPTIONS = [
  { id: 'hot', label: '最熱門', icon: Flame },
  { id: 'new', label: '最新', icon: Clock },
  { id: 'trending', label: '話題中', icon: TrendingUp },
]

// ── Constants ──────────────────────────────────────────
const MAX_IMAGE_SIZE_MB = 2     // 2 MB per image
const MAX_VIDEO_SIZE_MB = 50    // 50 MB per video
const MAX_IMAGES = 4

// ── Storage helpers ────────────────────────────────────
function getStoredPosts(): ForumPost[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('echotree_forum') ?? '[]') }
  catch { return [] }
}

// ── File helpers ───────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Sub-components ─────────────────────────────────────
function CategoryBadge({ cat }: { cat: string }) {
  const c = CATEGORIES.find(c => c.id === cat)
  if (!c) return null
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.color}`}>
      {c.icon} {c.label}
    </span>
  )
}

function PostCard({ post }: { post: ForumPost }) {
  const hasImages = post.images && post.images.length > 0
  const hasVideo = !!post.video
  return (
    <Link href={`/forum/${post.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 cursor-pointer">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-xl shrink-0">
            {post.avatar}
          </div>

          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {post.pinned && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Pin className="h-2.5 w-2.5" />置頂</span>}
              {post.hot && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Flame className="h-2.5 w-2.5" />熱門</span>}
              <CategoryBadge cat={post.category} />
              {hasImages && (
                <span className="text-[10px] bg-sky-50 text-sky-600 font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <ImageIcon className="h-2.5 w-2.5" />{post.images!.length}
                </span>
              )}
              {hasVideo && (
                <span className="text-[10px] bg-purple-50 text-purple-600 font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Video className="h-2.5 w-2.5" />影片
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2">{post.title}</h3>

            {/* Thumbnail strip (if images) */}
            {hasImages && (
              <div className="flex gap-1.5 mb-2 overflow-hidden">
                {post.images!.slice(0, 3).map((src, i) => (
                  <div key={i} className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 2 && post.images!.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                        +{post.images!.length - 3}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Body preview */}
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{post.body}</p>

            {/* Tags */}
            <div className="flex gap-1 flex-wrap mb-2">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="font-medium text-gray-600">{post.author}</span>
              <span>{post.createdAt}</span>
              <div className="flex items-center gap-1 ml-auto">
                <Eye className="h-3 w-3" />{post.views.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />{post.likes}
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-medium">
                <MessageSquare className="h-3 w-3" />{post.replies}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Upload Preview Components ──────────────────────────
function ImageUploadArea({
  images, videoFile, onImagesChange, onVideoChange
}: {
  images: string[]
  videoFile: File | null
  onImagesChange: (imgs: string[]) => void
  onVideoChange: (file: File | null) => void
}) {
  const imgRef = useRef<HTMLInputElement>(null)
  const vidRef = useRef<HTMLInputElement>(null)
  const [imgError, setImgError] = useState('')
  const [vidError, setVidError] = useState('')
  const [processing, setProcessing] = useState(false)

  async function handleImageFiles(files: FileList | null) {
    if (!files) return
    setImgError('')
    setProcessing(true)
    const newImages: string[] = []
    const remaining = MAX_IMAGES - images.length

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) { setImgError('請選擇圖片檔案（JPG、PNG、GIF、WEBP）'); continue }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setImgError(`圖片大小不能超過 ${MAX_IMAGE_SIZE_MB} MB（${file.name} 為 ${formatBytes(file.size)}）`)
        continue
      }
      const b64 = await fileToBase64(file)
      newImages.push(b64)
    }
    if (files.length > remaining) {
      setImgError(`最多上傳 ${MAX_IMAGES} 張圖片`)
    }
    onImagesChange([...images, ...newImages])
    setProcessing(false)
    if (imgRef.current) imgRef.current.value = ''
  }

  function handleVideoFile(files: FileList | null) {
    if (!files || !files[0]) return
    setVidError('')
    const file = files[0]
    if (!file.type.startsWith('video/')) { setVidError('請選擇影片檔案（MP4、MOV、WEBM）'); return }
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setVidError(`影片大小不能超過 ${MAX_VIDEO_SIZE_MB} MB（目前 ${formatBytes(file.size)}）`)
      return
    }
    onVideoChange(file)
    if (vidRef.current) vidRef.current.value = ''
  }

  function removeImage(idx: number) {
    onImagesChange(images.filter((_, i) => i !== idx))
    setImgError('')
  }

  return (
    <div className="space-y-3">
      {/* Image upload */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5 text-sky-500" />
            上傳圖片
            <span className="text-gray-400 font-normal ml-1">（最多 {MAX_IMAGES} 張，每張 ≤ {MAX_IMAGE_SIZE_MB} MB）</span>
          </p>
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => imgRef.current?.click()}
              disabled={processing}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium disabled:opacity-50"
            >
              {processing ? '處理中...' : '+ 新增'}
            </button>
          )}
        </div>
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleImageFiles(e.target.files)}
        />

        {images.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {images.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 group">
                <img src={src} alt={`上傳圖片 ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => imgRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-sky-400 text-gray-400 hover:text-sky-500 flex flex-col items-center justify-center transition-colors text-xs gap-1"
              >
                <Plus className="h-4 w-4" />
                新增
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imgRef.current?.click()}
            className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-sky-400 text-gray-400 hover:text-sky-500 flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <ImageIcon className="h-5 w-5" />
            點擊選擇圖片
          </button>
        )}

        {imgError && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 bg-red-50 rounded-lg px-2.5 py-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />{imgError}
          </div>
        )}
      </div>

      {/* Video upload */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <Video className="h-3.5 w-3.5 text-purple-500" />
            上傳影片
            <span className="text-gray-400 font-normal ml-1">（1 支，≤ {MAX_VIDEO_SIZE_MB} MB）</span>
          </p>
          {!videoFile && (
            <button
              type="button"
              onClick={() => vidRef.current?.click()}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              + 新增
            </button>
          )}
        </div>
        <input
          ref={vidRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={e => handleVideoFile(e.target.files)}
        />

        {videoFile ? (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Video className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{videoFile.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(videoFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => { onVideoChange(null); setVidError('') }}
              className="p-1.5 rounded-full hover:bg-purple-100 text-purple-400 hover:text-purple-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => vidRef.current?.click()}
            className="w-full h-16 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 text-gray-400 hover:text-purple-500 flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Video className="h-5 w-5" />
            點擊選擇影片
          </button>
        )}

        {vidError && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 bg-red-50 rounded-lg px-2.5 py-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />{vidError}
          </div>
        )}
        {videoFile && (
          <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />影片僅在本次瀏覽階段顯示，重新整理後需重新上傳
          </p>
        )}
      </div>
    </div>
  )
}

// ── New Post Modal ─────────────────────────────────────
function NewPostModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (p: ForumPost, video: File | null) => void }) {
  const user = useUser()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('fan')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)

  function handleSubmit() {
    if (!title.trim()) { setError('請輸入標題'); return }
    if (!body.trim()) { setError('請輸入內容'); return }
    if (!user.verified) { setError('請先完成手機驗證才能發文'); return }

    const post: ForumPost = {
      id: `user-${Date.now()}`,
      category,
      title: title.trim(),
      body: body.trim(),
      author: user.phone ? `用戶 ${user.phone.slice(-4)}` : '訪客',
      avatar: '',
      createdAt: new Date().toISOString().slice(0, 10),
      replies: 0, likes: 0, views: 1,
      tags: tags.split(/[,，\s]+/).filter(Boolean).slice(0, 5),
      images: images.length > 0 ? images : undefined,
      videoName: videoFile?.name,
    }
    onSubmit(post, videoFile)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto p-5 max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-lg font-bold">發表新文章</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-2">
          {/* Category */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">分類</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    category === c.id ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">標題</p>
            <Input placeholder="輸入文章標題..." value={title} onChange={e => setTitle(e.target.value)} maxLength={60} />
          </div>

          {/* Body */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">內容</p>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
              rows={4}
              placeholder="分享你的想法、心得或資訊..."
              value={body}
              onChange={e => setBody(e.target.value)}
              maxLength={2000}
            />
            <p className="text-[10px] text-gray-400 text-right">{body.length}/2000</p>
          </div>

          {/* Media Upload */}
          <div className="border border-gray-100 rounded-2xl p-3 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="text-base"></span>附加媒體
            </p>
            <ImageUploadArea
              images={images}
              videoFile={videoFile}
              onImagesChange={setImages}
              onVideoChange={setVideoFile}
            />
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">標籤（用逗號分隔，最多 5 個）</p>
            <Input placeholder="例：PSY, 演唱會, 心得" value={tags} onChange={e => setTags(e.target.value)} />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          {!user.verified && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
              <span></span>
              <span>發文前需先完成手機驗證。</span>
              <Link href="/verify" className="font-bold underline">前往驗證</Link>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>取消</Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
            發表文章
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────
export default function ForumPage() {
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('hot')
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [userPosts, setUserPosts] = useState<ForumPost[]>([])

  useEffect(() => {
    setUserPosts(getStoredPosts())
  }, [])

  const allPosts = [...userPosts, ...MOCK_POSTS]

  const filtered = allPosts.filter(p => {
    const matchCat = category === 'all' || p.category === category
    const matchSearch = !search || p.title.includes(search) || p.body.includes(search) || p.tags.some(t => t.includes(search))
    return matchCat && matchSearch
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    if (sort === 'hot') return (b.likes + b.replies * 3) - (a.likes + a.replies * 3)
    if (sort === 'new') return b.createdAt.localeCompare(a.createdAt)
    if (sort === 'trending') return b.views - a.views
    return 0
  })

  function handleNewPost(post: ForumPost, videoFile: File | null) {
    // Register video object URL in the session store so the thread page can access it
    if (videoFile) {
      const url = URL.createObjectURL(videoFile)
      setSessionVideo(post.id, url)
    }
    // Save post to localStorage (images as base64; video is session-only)
    const stored = getStoredPosts()
    const updated = [post, ...stored]
    localStorage.setItem('echotree_forum', JSON.stringify(updated))
    setUserPosts(updated)
    setShowNew(false)
  }

  const totalPosts = allPosts.length
  const totalReplies = allPosts.reduce((s, p) => s + p.replies, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white px-4 pt-6 pb-16">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h1 className="text-xl font-bold">回音論壇</h1>
            </div>
            <Button
              size="sm"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold"
              onClick={() => setShowNew(true)}
            >
              <Plus className="h-4 w-4 mr-1" />發文
            </Button>
          </div>
          <p className="text-emerald-100 text-sm mb-4">分享心得・票券交流・ESG 行動</p>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xl font-bold">{totalPosts}</p>
              <p className="text-emerald-200 text-xs">篇文章</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{totalReplies.toLocaleString()}</p>
              <p className="text-emerald-200 text-xs">則回覆</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">1.2K</p>
              <p className="text-emerald-200 text-xs">活躍成員</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 -mt-8">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜尋文章、標籤..."
            className="pl-9 bg-white shadow-sm border-0 rounded-2xl"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-4">
          {SORT_OPTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sort === s.id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500 border hover:bg-gray-50'
              }`}
            >
              <s.icon className="h-3 w-3" />{s.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 flex items-center">{filtered.length} 篇</span>
        </div>

        {/* Posts */}
        <div className="space-y-3 pb-24">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>找不到符合的文章</p>
            </div>
          ) : (
            filtered.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowNew(true)}
        className="fixed bottom-6 right-4 z-40 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
      >
        <Plus className="h-6 w-6" />
      </button>

      {showNew && <NewPostModal onClose={() => setShowNew(false)} onSubmit={handleNewPost} />}
    </div>
  )
}
