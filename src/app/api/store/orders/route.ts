// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Store Orders — GET /api/store/orders     ║
// ║  [MODULE: Store] 使用者的兌換紀錄                      ║
// ╚══════════════════════════════════════════════════════╝

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('store_orders')
    .select('*')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
