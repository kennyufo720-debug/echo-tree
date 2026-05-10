'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Search, Plus, ChevronRight, CheckCheck, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser } from '@/lib/store'
import {
  useConversations,
  findOrCreateConversation,
  getUnreadCount,
} from '@/lib/messages'

// ── Helpers ───────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  // dateStr is like "2026/4/25 下午10:00" or "2026-04-25"
  return dateStr.split(' ')[0]
}

function lastMsg(messages: { senderId: string; body: string }[]): { text: string; fromMe: boolean } | null {
  if (!messages.length) return null
  const last = messages[messages.length - 1]
  return { text: last.body, fromMe: last.senderId === 'me' }
}

// ── Conversation Card ─────────────────────────────────────
function ConvCard({ conv, unread }: { conv: ReturnType<typeof useConversations>[0]; unread: number }) {
  const last = lastMsg(conv.messages)
  return (
    <Link href={`/messages/${conv.id}`}>
      <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 ${unread > 0 ? 'bg-emerald-50/40' : ''}`}>
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-2xl">
            {conv.contactAvatar}
          </div>
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className={`text-sm font-semibold ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
              {conv.contactName}
            </span>
            <span className="text-[10px] text-gray-400 shrink-0 ml-2">{timeAgo(conv.createdAt)}</span>
          </div>
          {last ? (
            <p className={`text-xs truncate ${unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
              {last.fromMe && <span className="text-gray-400 mr-1">你：</span>}
              {last.text}
            </p>
          ) : (
            <p className="text-xs text-gray-300 italic">尚無訊息</p>
          )}
        </div>

        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
      </div>
    </Link>
  )
}

// ── Inner (needs useSearchParams) ─────────────────────────
function MessagesInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useUser()
  const convs = useConversations()
  const [search, setSearch] = useState('')

  // BUG-09 fix: extract primitives so effect doesn't re-run on every searchParams object recreation
  const toParam = searchParams.get('to') ?? ''
  const avatarParam = searchParams.get('avatar') ?? ''

  // Handle ?to=name&avatar=emoji redirect from forum
  useEffect(() => {
    if (!toParam) return
    if (!user.verified) return   // needs auth
    const convId = findOrCreateConversation(toParam, avatarParam)
    router.replace(`/messages/${convId}`)
  }, [toParam, avatarParam, user.verified, router])

  const filtered = convs.filter(c =>
    !search || c.contactName.includes(search) ||
    c.messages.some(m => m.body.includes(search))
  )

  const totalUnread = convs.reduce((sum, c) =>
    sum + c.messages.filter(m => m.senderId !== 'me' && !m.read).length, 0)

  if (!user.verified) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Lock className="h-9 w-9 text-gray-300" />
        </div>
        <h2 className="text-lg font-bold text-gray-700 mb-2">登入後才能使用私訊</h2>
        <p className="text-sm text-gray-400 mb-6">完成手機驗證，即可與其他回音樹用戶私訊交流</p>
        <Link href="/verify?redirect=/messages">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
            前往驗證 / 登入
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜尋對話或訊息..."
            className="pl-9 bg-gray-50 border-0 rounded-xl text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <MessageCircle className="h-14 w-14 text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">
            {search ? '找不到符合的對話' : '還沒有私訊'}
          </p>
          {!search && (
            <p className="text-gray-300 text-xs mt-1">到論壇找喜歡的用戶，點「私訊」開始聊天吧！</p>
          )}
        </div>
      ) : (
        <div>
          {filtered.map(conv => {
            const unread = conv.messages.filter(m => m.senderId !== 'me' && !m.read).length
            return <ConvCard key={conv.id} conv={conv} unread={unread} />
          })}
        </div>
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────
export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-600" />
          <h1 className="text-lg font-bold text-gray-900">私訊</h1>
        </div>
        <Link href="/forum">
          <Button size="sm" variant="outline" className="text-xs gap-1">
            <Plus className="h-3.5 w-3.5" />去論壇認識新朋友
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-gray-400 text-sm">載入中...</div>}>
        <MessagesInner />
      </Suspense>
    </div>
  )
}
