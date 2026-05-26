// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Messages — GET /api/messages             ║
// ║  [MODULE: Messages] 使用者的所有對話列表               ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('conversations')
    .select('id, user_phone, contact_name, contact_avatar, created_at, messages(body, created_at, read)')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result = (data ?? []).map(conv => ({
    ...conv,
    last_message: conv.messages?.at(-1)?.body ?? '',
    unread_count: conv.messages?.filter((m: { read: boolean }) => !m.read).length ?? 0,
    messages: undefined,
  }))

  return NextResponse.json(result)
}
