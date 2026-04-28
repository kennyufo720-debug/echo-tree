'use client'
import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Heart, MessageSquare, Eye, Share2, Bookmark, Send, ThumbsUp, Flag, Pin, Flame, ImageIcon, Video, X, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MOCK_POSTS, ForumPost } from '../page'
import { useUser, useSessionVideo } from '@/lib/store'
import { findOrCreateConversation } from '@/lib/messages'
import { mockEvents } from '@/lib/mock-data'

// ── Types ──────────────────────────────────────────────
interface Reply {
  id: string
  author: string
  avatar: string
  body: string
  createdAt: string
  likes: number
  liked?: boolean
}

// ── Mock Replies ───────────────────────────────────────
const MOCK_REPLIES: Record<string, Reply[]> = {
  p1: [
    { id: 'r1', author: '防水達人', avatar: '', body: '上次在首爾場第一排，整個人濕透！帶防水袋超重要，我還帶了雨衣 XD', createdAt: '2026-04-26 14:23', likes: 45 },
    { id: 'r2', author: '台北場期待中', avatar: '', body: '大巨蛋有頂，應該不用擔心淋到外圍的人，但前10排一定要有心理準備', createdAt: '2026-04-26 15:10', likes: 32 },
    { id: 'r3', author: '回音樹粉', avatar: '', body: '有買 VIP 的注意！上次 VIP 區水柱最密集，記得帶備用手機充電線', createdAt: '2026-04-26 16:45', likes: 28 },
  ],
  p3: [
    { id: 'r4', author: '葉綠青', avatar: '', body: '恭喜林大地！我排名第二追不上你啊  繼續努力！', createdAt: '2026-04-24 10:15', likes: 67 },
    { id: 'r5', author: 'ESG研究員', avatar: '', body: '名人堂第一！這背後的碳匯量相當於一個家庭一年的碳排放，非常有意義', createdAt: '2026-04-24 11:30', likes: 89 },
  ],
  p5: [
    { id: 'r6', author: '永續粉', avatar: '', body: '這篇太詳細了！分享給我的公司 CSR 部門看，我們打算包場來參與 ESG 音樂節', createdAt: '2026-04-22 13:00', likes: 123 },
    { id: 'r7', author: '南投在地人', avatar: '', body: '周杰倫森林我去現場看過！樹都長得不錯，每棵都有掛牌寫是哪場演唱會種的', createdAt: '2026-04-22 16:30', likes: 95 },
  ],
  p9: [
    { id: 'r8', author: '單身PSY粉', avatar: '', body: '我也一個人！F區幾排？可以的話坐一起超開心，濕身要有伴啊哈哈', createdAt: '2026-04-26 10:05', likes: 18 },
    { id: 'r9', author: '夜貓子', avatar: '', body: '演唱會後吃宵夜 +1！附近有家很讚的鹽酥雞推薦大家', createdAt: '2026-04-26 11:22', likes: 12 },
    { id: 'r10', author: '阿志', avatar: '', body: '已私訊！期待認識新朋友～', createdAt: '2026-04-26 14:00', likes: 7 },
  ],
  p11: [
    { id: 'r11', author: '茄子蛋控', avatar: '', body: '台中人在這！我也是從草東開始，現在茄子蛋也超愛，可以交流 ', createdAt: '2026-04-24 09:30', likes: 34 },
    { id: 'r12', author: '北部草東粉', avatar: '', body: '台北人但很常跑台中場！下次草東有演出一起約？', createdAt: '2026-04-24 13:45', likes: 21 },
  ],
  p12: [
    { id: 'r13', author: '粉絲A', avatar: '', body: '已填表單！好期待見面會，我做了手工燈牌想分享給大家', createdAt: '2026-04-23 16:10', likes: 45 },
    { id: 'r14', author: '桃園來的', avatar: '', body: '從桃園坐高鐵去，有沒有人要一起？可以拼計程車', createdAt: '2026-04-23 17:30', likes: 28 },
    { id: 'r15', author: '回音小樹苗', avatar: '', body: '謝謝大家踴躍報名！目前有 23 人，場地已確認，詳細地址私訊給已填表的朋友 ', createdAt: '2026-04-23 20:00', likes: 67 },
  ],
  p13: [
    { id: 'r16', author: '新手收藏家', avatar: '', body: '請問 03 號和 07 號哪個比較難拿？我剛開始收集，想先從容易的入門', createdAt: '2026-04-26 09:10', likes: 22 },
    { id: 'r17', author: '碎片獵人', avatar: '', body: '建議先拿 01→02→03，前三片最簡單，打基礎後再衝 07。加油！', createdAt: '2026-04-26 09:45', likes: 38 },
    { id: 'r18', author: '台北攻略王', avatar: '', body: '路線圖貼出來超感謝！我照你的順序跑，一個週末就拿了五片，效率超高', createdAt: '2026-04-26 14:00', likes: 51 },
  ],
  p14: [
    { id: 'r19', author: '等待解鎖中', avatar: '', body: '我昨天發文了，貼了 #子瑜 標籤，正在等讚中... 朋友們幫我推一下 ', createdAt: '2026-04-25 18:30', likes: 15 },
    { id: 'r20', author: '子瑜應援團長', avatar: '', body: '去幫你按了！大家也幫幫他，讓更多人解鎖這塊碎片 ', createdAt: '2026-04-25 19:00', likes: 44 },
  ],
  p16: [
    { id: 'r21', author: '傳說挑戰者', avatar: '', body: '我有 5 場紀錄，但碎片差台北 09 還沒拿到... 求助！', createdAt: '2026-04-23 12:20', likes: 33 },
    { id: 'r22', author: '迴響之源解鎖者', avatar: '', body: '我解開了！！！截圖在這裡，真的超美的金色動態效果，收藏夾出現光芒特效', createdAt: '2026-04-23 20:15', likes: 189 },
    { id: 'r23', author: '全場震驚', avatar: '', body: '樓上已解鎖！！！快跟我們說完整條件啊！！', createdAt: '2026-04-23 20:30', likes: 97 },
  ],
  p18: [
    { id: 'r24', author: '簽到第12天', avatar: '', body: '我連續簽到 7 天沒掉落，是機率問題嗎？還是有其他條件？', createdAt: '2026-04-21 11:30', likes: 19 },
    { id: 'r25', author: '回音研究院', avatar: '', body: '機率確實不高，我連試了三週才掉一次，要有耐心！但點數兌換很划算', createdAt: '2026-04-21 12:10', likes: 42 },
    { id: 'r26', author: '迷途碎片收藏家', avatar: '', body: '迷途碎片我已經拿到 4 個了，全換成點數，買了限定周邊！', createdAt: '2026-04-21 15:45', likes: 78 },
  ],
}

// ── Helpers ────────────────────────────────────────────
function getStoredPost(id: string): ForumPost | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const posts: ForumPost[] = JSON.parse(localStorage.getItem('echotree_forum') ?? '[]')
    return posts.find(p => p.id === id)
  } catch { return undefined }
}

function getStoredReplies(postId: string): Reply[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(`echotree_replies_${postId}`) ?? '[]') }
  catch { return [] }
}

function saveReplies(postId: string, replies: Reply[]) {
  localStorage.setItem(`echotree_replies_${postId}`, JSON.stringify(replies))
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  event:  { label: '活動討論', icon: '', color: 'bg-emerald-50 text-emerald-700' },
  ticket: { label: '票券交流', icon: '', color: 'bg-blue-50 text-blue-700' },
  fan:    { label: '粉絲心得', icon: '', color: 'bg-pink-50 text-pink-700' },
  esg:    { label: 'ESG 行動', icon: '', color: 'bg-green-50 text-green-700' },
  social:   { label: '揪人交友', icon: '',  color: 'bg-orange-50 text-orange-600' },
  treasure: { label: '藏寶圖',   icon: '', color: 'bg-yellow-50 text-yellow-700' },
}

// ── Image Gallery ──────────────────────────────────────
function ImageGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const grid =
    images.length === 1 ? 'grid-cols-1' :
    images.length === 2 ? 'grid-cols-2' :
    images.length === 3 ? 'grid-cols-3' :
    'grid-cols-2'

  return (
    <>
      <div className={`grid ${grid} gap-1.5 rounded-2xl overflow-hidden`}>
        {images.map((src, i) => {
          const isLast = i === 3 && images.length > 4
          return (
            <div
              key={i}
              className={`relative overflow-hidden bg-gray-100 cursor-zoom-in ${
                images.length === 1 ? 'aspect-video' :
                images.length === 3 && i === 0 ? 'row-span-1' : 'aspect-square'
              }`}
              style={images.length === 1 ? {} : {}}
              onClick={() => setLightbox(i)}
            >
              <img src={src} alt={`圖片 ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
              {isLast && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold">
                  +{images.length - 4}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
        <ImageIcon className="h-3 w-3" />{images.length} 張圖片
      </p>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          {lightbox > 0 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white p-2 text-2xl"
              onClick={e => { e.stopPropagation(); setLightbox(l => (l! - 1 + images.length) % images.length) }}
            >
              ‹
            </button>
          )}
          <img
            src={images[lightbox]}
            alt={`圖片 ${lightbox + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          {lightbox < images.length - 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white p-2 text-2xl"
              onClick={e => { e.stopPropagation(); setLightbox(l => (l! + 1) % images.length) }}
            >
              ›
            </button>
          )}
          <div className="absolute bottom-4 text-white/60 text-sm">{lightbox + 1} / {images.length}</div>
        </div>
      )}
    </>
  )
}

// ── Reply Card ─────────────────────────────────────────
function ReplyCard({ reply, onLike }: { reply: Reply; onLike: (id: string) => void }) {
  return (
    <div className="flex gap-3 py-4">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg shrink-0">
        {reply.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">{reply.author}</span>
          <span className="text-xs text-gray-400">{reply.createdAt}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-2">{reply.body}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(reply.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${reply.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
          >
            <Heart className={`h-3.5 w-3.5 ${reply.liked ? 'fill-red-500' : ''}`} />
            {reply.likes}
          </button>
          <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />讚
          </button>
          <button className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1">
            <Flag className="h-3 w-3" />檢舉
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────
export default function ForumThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const user = useUser()
  const sessionVideoUrl = useSessionVideo(id)

  const [post, setPost] = useState<ForumPost | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyText, setReplyText] = useState('')
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const found = MOCK_POSTS.find(p => p.id === id) ?? getStoredPost(id)
    if (found) {
      setPost(found)
      setLikeCount(found.likes)
    }
    const base = MOCK_REPLIES[id] ?? []
    const stored = getStoredReplies(id)
    setReplies([...base, ...stored])
  }, [id])

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-400">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>找不到這篇文章</p>
        <Link href="/forum"><Button variant="outline" className="mt-4">返回論壇</Button></Link>
      </div>
    )
  }

  const catInfo = CATEGORY_LABELS[post.category] ?? { label: post.category, icon: '', color: 'bg-gray-100 text-gray-600' }
  const relatedEvent = post.eventId ? mockEvents.find(e => e.id === post.eventId) : null

  function handleDM() {
    if (!user.verified) {
      router.push('/verify?redirect=' + encodeURIComponent(`/forum/${id}`))
      return
    }
    // Don't DM yourself
    if (!post) return
    const myName = user.phone ? `用戶 ${user.phone.slice(-4)}` : ''
    if (post.author === myName) return
    const convId = findOrCreateConversation(post.author, post.avatar)
    router.push(`/messages/${convId}`)
  }

  function handleLike() {
    if (liked) { setLikeCount(c => c - 1); setLiked(false) }
    else { setLikeCount(c => c + 1); setLiked(true) }
  }

  function handleLikeReply(replyId: string) {
    setReplies(prev => prev.map(r =>
      r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
    ))
  }

  async function handleSubmitReply() {
    if (!replyText.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 500))
    const newReply: Reply = {
      id: `reply-${Date.now()}`,
      author: user.verified ? `用戶 ${user.phone.slice(-4)}` : '訪客',
      avatar: '',
      body: replyText.trim(),
      createdAt: new Date().toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' }),
      likes: 0,
    }
    const newReplies = [...replies, newReply]
    const storedPart = newReplies.filter(r => !MOCK_REPLIES[id]?.some(m => m.id === r.id))
    saveReplies(id, storedPart)
    setReplies(newReplies)
    setReplyText('')
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-white border-b px-4 py-2 flex items-center gap-2">
        <Link href="/forum" className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm">
          <ChevronLeft className="h-4 w-4" />
          論壇
        </Link>
        <ChevronLeft className="h-3 w-3 text-gray-300 rotate-180" />
        <span className="text-xs text-gray-400 truncate flex-1">{post.title}</span>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-5">
        {/* Post */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {post.pinned && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Pin className="h-2.5 w-2.5" />置頂</span>}
            {post.hot && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Flame className="h-2.5 w-2.5" />熱門</span>}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catInfo.color}`}>{catInfo.icon} {catInfo.label}</span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{post.title}</h1>

          {/* Author */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-base">
              {post.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-800">{post.author}</span>
              <span className="text-xs text-gray-400 ml-2">{post.createdAt}</span>
            </div>
            <button
              onClick={handleDM}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
            >
              <MessageCircle className="h-3.5 w-3.5" />私訊作者
            </button>
          </div>

          {/* Body */}
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">{post.body}</p>

          {/* Image Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="mb-4">
              <ImageGallery images={post.images} />
            </div>
          )}

          {/* Video Player */}
          {(post.video || sessionVideoUrl || post.videoName) && (
            <div className="mb-4">
              {(post.video || sessionVideoUrl) ? (
                <div className="rounded-2xl overflow-hidden bg-black aspect-video">
                  <video
                    src={post.video || sessionVideoUrl}
                    controls
                    className="w-full h-full"
                    preload="metadata"
                  />
                </div>
              ) : (
                /* Video not available (session expired / page reloaded) */
                <div className="rounded-2xl bg-gray-100 aspect-video flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Video className="h-10 w-10 opacity-30" />
                  <p className="text-sm">影片僅在上傳當次瀏覽有效</p>
                  <p className="text-xs opacity-70">（重新整理後影片連結失效）</p>
                </div>
              )}
              {post.videoName && (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Video className="h-3 w-3" />{post.videoName}
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Related Event */}
          {relatedEvent && (
            <Link href={`/events/${relatedEvent.id}`}>
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4 hover:bg-emerald-100 transition-colors">
                <img src={relatedEvent.image} alt={relatedEvent.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-emerald-600 font-medium mb-0.5">相關活動</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{relatedEvent.title}</p>
                  <p className="text-xs text-gray-400">{relatedEvent.date} · {relatedEvent.venue}</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-emerald-400 rotate-180 shrink-0" />
              </div>
            </Link>
          )}

          <Separator className="my-3" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${liked ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-red-500' : ''}`} />{likeCount}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100">
              <MessageSquare className="h-4 w-4" />{replies.length}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100">
              <Eye className="h-4 w-4" />{post.views.toLocaleString()}
            </button>
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setSaved(s => !s)}
                className={`p-2 rounded-xl transition-all ${saved ? 'bg-amber-50 text-amber-500' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <Bookmark className={`h-4 w-4 ${saved ? 'fill-amber-500' : ''}`} />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            回覆 ({replies.length})
          </h2>
          <Separator className="my-3" />

          {replies.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">還沒有回覆，搶先留言！</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {replies.map(reply => (
                <ReplyCard key={reply.id} reply={reply} onLike={handleLikeReply} />
              ))}
            </div>
          )}
        </div>

        {/* Reply Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {user.verified ? `以 ${user.phone} 身份回覆` : '留下你的回覆'}
          </p>
          {!user.verified && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 mb-3 text-xs text-amber-700 flex items-center gap-2">
              <span> 未驗證可以留言，但建議先</span>
              <Link href="/verify" className="font-bold underline">完成驗證</Link>
            </div>
          )}
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-lg shrink-0">
              {user.verified ? '' : ''}
            </div>
            <div className="flex-1">
              <textarea
                className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                rows={3}
                placeholder="分享你的看法..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-400">{replyText.length}/500</span>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={!replyText.trim() || submitting}
                  onClick={handleSubmitReply}
                >
                  {submitting ? '送出中...' : <><Send className="h-3.5 w-3.5 mr-1" />回覆</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
