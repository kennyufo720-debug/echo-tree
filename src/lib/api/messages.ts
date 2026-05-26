// ╔══════════════════════════════════════════════════════╗
// ║  MODULE: Messages（私訊系統）                          ║
// ║  修改此檔案來變更對話/通知邏輯                            ║
// ╚══════════════════════════════════════════════════════╝

const BASE = '/api/messages'

export interface Conversation {
  id: string
  user_phone: string
  contact_name: string
  contact_avatar: string
  created_at: string
  last_message?: string
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  read: boolean
  created_at: string
}

export async function fetchConversations(phone: string): Promise<Conversation[]> {
  const res = await fetch(`${BASE}?phone=${encodeURIComponent(phone)}`)
  if (!res.ok) throw new Error('Failed to fetch conversations')
  return res.json()
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/${conversationId}`)
  if (!res.ok) throw new Error('Failed to fetch messages')
  return res.json()
}

export async function sendMessage(conversationId: string, senderId: string, body: string): Promise<Message> {
  const res = await fetch(`${BASE}/${conversationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender_id: senderId, body }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

export async function markRead(conversationId: string): Promise<void> {
  await fetch(`${BASE}/${conversationId}/read`, { method: 'POST' })
}
