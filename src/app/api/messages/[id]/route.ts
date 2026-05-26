// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Messages — GET/POST /api/messages/[id]   ║
// ║  [MODULE: Messages] 讀取 & 發送單一對話的訊息           ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

// GET 取得對話訊息
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST 發送新訊息
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sender_id, body } = await req.json()

  if (!sender_id || !body) {
    return NextResponse.json({ error: 'sender_id and body required' }, { status: 400 })
  }

  const { data, error } = await getSupabase()
    .from('messages')
    .insert([{ conversation_id: id, sender_id, body, read: false }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
