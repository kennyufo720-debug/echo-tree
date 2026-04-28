'use client'
import { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────
export interface DirectMessage {
  id: string
  senderId: 'me' | string   // 'me' = current user, else contact name
  body: string
  createdAt: string
  read: boolean
}

export interface Conversation {
  id: string            // stable id, e.g. "conv_碎片獵人"
  contactName: string
  contactAvatar: string
  messages: DirectMessage[]
  createdAt: string
}

// ── Storage key ───────────────────────────────────────────
const KEY = 'echotree_messages'
const EV  = 'echotree:messages'

// ── Seed data (shown on first visit) ─────────────────────
const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_碎片獵人',
    contactName: '碎片獵人',
    contactAvatar: '',
    createdAt: '2026-04-25 10:00',
    messages: [
      { id: 'm1', senderId: '碎片獵人', body: '你好！看到你在論壇問台北系列的攻略，我有整理一份路線圖，要的話可以給你', createdAt: '2026-04-25 10:00', read: true },
      { id: 'm2', senderId: 'me', body: '太感謝了！請問 07 號碎片需要現場打卡嗎？', createdAt: '2026-04-25 10:05', read: true },
      { id: 'm3', senderId: '碎片獵人', body: '07 號要去信義區的演唱會場館附近打卡，半徑 200 公尺內就行，不用進場 ', createdAt: '2026-04-25 10:08', read: true },
      { id: 'm4', senderId: 'me', body: '好的！那我下週末去試試，謝謝你', createdAt: '2026-04-25 10:10', read: true },
      { id: 'm5', senderId: '碎片獵人', body: '加油！拿到的話來論壇分享一下 ', createdAt: '2026-04-25 10:11', read: false },
    ],
  },
  {
    id: 'conv_子瑜應援團長',
    contactName: '子瑜應援團長',
    contactAvatar: '',
    createdAt: '2026-04-24 18:30',
    messages: [
      { id: 'm6', senderId: 'me', body: '你好！你的「森之呼吸」解鎖攻略超有用，我昨天試成功了！', createdAt: '2026-04-24 18:30', read: true },
      { id: 'm7', senderId: '子瑜應援團長', body: '太棒了！恭喜你解鎖！那個碎片的動態效果很漂亮對吧 ', createdAt: '2026-04-24 18:45', read: true },
      { id: 'm8', senderId: 'me', body: '真的超美！問你一下，06 號的條件我在攻略文裡找不到？', createdAt: '2026-04-24 19:00', read: true },
      { id: 'm9', senderId: '子瑜應援團長', body: '06 號目前還沒公開，應該是下次更新才會開放，我也在等！', createdAt: '2026-04-24 19:10', read: false },
    ],
  },
  {
    id: 'conv_回音小樹苗',
    contactName: '回音小樹苗',
    contactAvatar: '',
    createdAt: '2026-04-23 12:00',
    messages: [
      { id: 'm10', senderId: '回音小樹苗', body: '嗨！看到你報名了 5/10 見面會，場地已確認是大安區 XX 咖啡，下午 2 點入場 ', createdAt: '2026-04-23 12:00', read: true },
      { id: 'm11', senderId: 'me', body: '收到！我有做手工燈牌，到時候可以帶去分享嗎？', createdAt: '2026-04-23 12:15', read: true },
      { id: 'm12', senderId: '回音小樹苗', body: '當然！超歡迎，我們有準備一個展示區讓大家放周邊 ', createdAt: '2026-04-23 12:20', read: true },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────
export function getConversations(): Conversation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) {
      // First visit — seed demo data
      localStorage.setItem(KEY, JSON.stringify(SEED_CONVERSATIONS))
      return SEED_CONVERSATIONS
    }
    return JSON.parse(raw)
  } catch { return [] }
}

function saveConversations(convs: Conversation[]): void {
  localStorage.setItem(KEY, JSON.stringify(convs))
  window.dispatchEvent(new Event(EV))
}

export function getUnreadCount(): number {
  return getConversations().reduce((sum, c) =>
    sum + c.messages.filter(m => m.senderId !== 'me' && !m.read).length, 0)
}

/** Find or create a conversation with the given contact. Returns conversation id. */
export function findOrCreateConversation(contactName: string, contactAvatar: string): string {
  const convs = getConversations()
  const existing = convs.find(c => c.contactName === contactName)
  if (existing) return existing.id
  const newConv: Conversation = {
    id: `conv_${contactName}_${Date.now()}`,
    contactName,
    contactAvatar,
    messages: [],
    createdAt: new Date().toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' }),
  }
  saveConversations([newConv, ...convs])
  return newConv.id
}

export function sendMessage(convId: string, body: string): void {
  const convs = getConversations()
  const idx = convs.findIndex(c => c.id === convId)
  if (idx === -1) return
  const msg: DirectMessage = {
    id: `msg_${Date.now()}`,
    senderId: 'me',
    body,
    createdAt: new Date().toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' }),
    read: true,
  }
  convs[idx].messages = [...convs[idx].messages, msg]
  // Bubble to top
  const updated = [convs[idx], ...convs.filter((_, i) => i !== idx)]
  saveConversations(updated)

  // Simulate reply after 1.5s
  scheduleAutoReply(convId, convs[idx].contactName, convs[idx].contactAvatar)
}

export function markConversationRead(convId: string): void {
  const convs = getConversations()
  const idx = convs.findIndex(c => c.id === convId)
  if (idx === -1) return
  convs[idx].messages = convs[idx].messages.map(m => ({ ...m, read: true }))
  saveConversations(convs)
}

// ── Auto-reply simulator ──────────────────────────────────
const AUTO_REPLIES: Record<string, string[]> = {
  '碎片獵人':     [' 收到！', '好的，我知道了！', '謝謝你的訊息，我等等回你', '有空一起揪碎片！'],
  '子瑜應援團長': [' 好的！', '哈哈謝謝你！', '子瑜一定會喜歡我們這樣支持她的！', '加油一起收集！'],
  '回音小樹苗':   [' 好的！', '謝謝你！期待見面！', '見面會一定很棒，加油！'],
}
const DEFAULT_REPLIES = ['好的，我知道了！', '謝謝你的訊息 ', '收到！', '哈哈，好的！', '有機會一起來玩吧！']

function scheduleAutoReply(convId: string, contactName: string, contactAvatar: string) {
  if (typeof window === 'undefined') return
  const delay = 1200 + Math.random() * 1200
  setTimeout(() => {
    const pool = AUTO_REPLIES[contactName] ?? DEFAULT_REPLIES
    const body = pool[Math.floor(Math.random() * pool.length)]
    const convs = getConversations()
    const idx = convs.findIndex(c => c.id === convId)
    if (idx === -1) return
    const reply: DirectMessage = {
      id: `msg_${Date.now()}`,
      senderId: contactName,
      body,
      createdAt: new Date().toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' }),
      read: false,
    }
    convs[idx].messages = [...convs[idx].messages, reply]
    saveConversations(convs)
  }, delay)
}

// ── React hooks ───────────────────────────────────────────
export function useConversations(): Conversation[] {
  const [convs, setConvs] = useState<Conversation[]>([])
  const refresh = useCallback(() => setConvs(getConversations()), [])
  useEffect(() => {
    refresh()
    window.addEventListener(EV, refresh)
    return () => window.removeEventListener(EV, refresh)
  }, [refresh])
  return convs
}

export function useConversation(id: string): Conversation | null {
  const [conv, setConv] = useState<Conversation | null>(null)
  const refresh = useCallback(() => {
    const found = getConversations().find(c => c.id === id) ?? null
    setConv(found)
  }, [id])
  useEffect(() => {
    refresh()
    window.addEventListener(EV, refresh)
    return () => window.removeEventListener(EV, refresh)
  }, [refresh])
  return conv
}

export function useUnreadCount(): number {
  const [count, setCount] = useState(0)
  const refresh = useCallback(() => setCount(getUnreadCount()), [])
  useEffect(() => {
    refresh()
    window.addEventListener(EV, refresh)
    return () => window.removeEventListener(EV, refresh)
  }, [refresh])
  return count
}
