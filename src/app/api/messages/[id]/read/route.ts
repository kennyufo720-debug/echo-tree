// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Messages Read — POST /api/messages/[id]/read ║
// ║  [MODULE: Messages] 標記對話訊息為已讀                  ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { error } = await getSupabase()
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', id)
    .eq('read', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
