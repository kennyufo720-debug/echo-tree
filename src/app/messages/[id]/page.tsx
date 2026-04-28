'use client'
import { useState, use, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Send, MoreVertical, Phone, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUser } from '@/lib/store'
import { useConversation, sendMessage, markConversationRead } from '@/lib/messages'

// ── Bubble ─────────────────────────────────────────────────
function Bubble({ body, fromMe, time, avatar }: {
  body: string; fromMe: boolean; time: string; avatar?: string
}) {
  return (
    <div className={`flex items-end gap-2 ${fromMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!fromMe && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-base shrink-0 mb-1">
          {avatar}
        </div>
      )}
      <div className={`max-w-[72%] ${fromMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          fromMe
            ? 'bg-emerald-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}>
          {body}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{time}</span>
      </div>
    </div>
  )
}

// ── Date divider ───────────────────────────────────────────
function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[11px] text-gray-400 bg-white px-2 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────
export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const user = useUser()
  const conv = useConversation(id)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Mark as read on open
  useEffect(() => {
    if (conv) markConversationRead(id)
  }, [id, conv?.messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv?.messages.length])

  if (!user.verified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-gray-500 mb-4">請先完成手機驗證才能使用私訊</p>
        <Link href="/verify?redirect=/messages">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">前往驗證</Button>
        </Link>
      </div>
    )
  }

  if (!conv) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-gray-400">找不到這則對話</p>
        <Link href="/messages" className="mt-4">
          <Button variant="outline">返回私訊</Button>
        </Link>
      </div>
    )
  }

  async function handleSend() {
    if (!text.trim() || sending) return
    setSending(true)
    const body = text.trim()
    setText('')
    sendMessage(id, body)
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date for dividers
  type MsgGroup = { date: string; msgs: typeof conv.messages }
  const groups = conv.messages.reduce<MsgGroup[]>((acc, msg) => {
    const date = msg.createdAt.split(' ')[0]
    const last = acc[acc.length - 1]
    if (last && last.date === date) {
      last.msgs.push(msg)
    } else {
      acc.push({ date, msgs: [msg] })
    }
    return acc
  }, [])

  const myName = user.phone ? `用戶 ${user.phone.slice(-4)}` : '我'

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
        <Link href="/messages" className="p-1 -ml-1 rounded-full hover:bg-gray-100 text-gray-500">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-lg shrink-0">
          {conv.contactAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{conv.contactName}</p>
          <p className="text-[11px] text-emerald-500">在線上</p>
        </div>
        <Link href={`/forum`}>
          <Button variant="ghost" size="sm" className="text-xs text-gray-400">
            查看貼文
          </Button>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Identity note */}
        <div className="text-center mb-2">
          <span className="text-[11px] text-gray-400 bg-gray-50 rounded-full px-3 py-1">
            你以「{myName}」的身份與 {conv.contactName} 對話
          </span>
        </div>

        {groups.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">傳送第一則訊息，開始和 {conv.contactName} 聊天吧！</p>
          </div>
        )}

        {groups.map(group => (
          <div key={group.date}>
            <DateDivider label={group.date} />
            <div className="space-y-3">
              {group.msgs.map(msg => (
                <Bubble
                  key={msg.id}
                  body={msg.body}
                  fromMe={msg.senderId === 'me'}
                  time={msg.createdAt.split(' ').slice(1).join(' ')}
                  avatar={conv.contactAvatar}
                />
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 min-h-[44px] flex items-end">
            <textarea
              ref={inputRef}
              className="w-full bg-transparent text-sm resize-none focus:outline-none max-h-32 leading-relaxed"
              rows={1}
              placeholder={`傳訊息給 ${conv.contactName}...`}
              value={text}
              onChange={e => {
                setText(e.target.value)
                // Auto-grow
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
              onKeyDown={handleKeyDown}
              maxLength={1000}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
              text.trim()
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 mt-1.5 text-center">按 Enter 送出 · Shift+Enter 換行</p>
      </div>
    </div>
  )
}
