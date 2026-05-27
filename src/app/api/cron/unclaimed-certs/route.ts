// ╔══════════════════════════════════════════════════════╗
// ║  CRON: Unclaimed Certs — GET /api/cron/unclaimed-certs║
// ║  [MODULE: Notifications] 每日廣播：超過 7 天未兌換    ║
// ╚══════════════════════════════════════════════════════╝
//
// 由 Vercel Cron Job 每日 01:00 UTC (09:00 UTC+8) 觸發
// 保護：Authorization: Bearer {CRON_SECRET}
//
// 邏輯：
//   1. 找出 status='paid' 且 created_at < 7 天前的訂單
//   2. 排除已有 tree_certificates 的訂單
//   3. 依 user_phone 合併（一人一則通知）
//   4. 排除 7 天內已收過系統通知的使用者（防重複）
//   5. 發送平台私訊 + Email（若有填 email）

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-server'
import { sendEmail, unclaimedCertTemplate } from '@/lib/email'

const SYSTEM_SENDER    = 'system'
const SYSTEM_CONTACT   = 'Echo Tree 系統'
const NOTIFY_INTERVAL  = 7 * 24 * 60 * 60 * 1000   // 7 天

// ── Auth guard ─────────────────────────────────────────
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true    // dev: no secret configured → allow
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = getSupabase()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // ── Step 1: 找 7 天前的 paid 訂單 ──────────────────────
  const { data: oldOrders, error: ordErr } = await sb
    .from('orders')
    .select('id, user_phone, event_title, seats')
    .eq('status', 'paid')
    .lt('created_at', sevenDaysAgo)
    .not('user_phone', 'eq', '')

  if (ordErr) return NextResponse.json({ error: ordErr.message }, { status: 500 })
  if (!oldOrders?.length) return NextResponse.json({ notified: 0, message: 'no old orders' })

  // ── Step 2: 找已兌換的 order_id ───────────────────────
  const orderIds = oldOrders.map(o => o.id)
  const { data: claimed } = await sb
    .from('tree_certificates')
    .select('order_id')
    .in('order_id', orderIds)

  const claimedSet = new Set((claimed ?? []).map(c => c.order_id))
  const unclaimed = oldOrders.filter(o => !claimedSet.has(o.id))
  if (!unclaimed.length) return NextResponse.json({ notified: 0, message: 'all claimed' })

  // ── Step 3: 依 user_phone 合併 ────────────────────────
  const byUser = new Map<string, string[]>()   // phone → event titles
  for (const order of unclaimed) {
    if (!byUser.has(order.user_phone)) byUser.set(order.user_phone, [])
    byUser.get(order.user_phone)!.push(order.event_title)
  }

  // ── Step 4 & 5: 逐一通知 ─────────────────────────────
  let notified = 0
  const phones = Array.from(byUser.keys())

  // 批量查 users 取 email
  const { data: users } = await sb
    .from('users')
    .select('phone, email')
    .in('phone', phones)

  const emailMap = new Map((users ?? []).map(u => [u.phone, u.email as string | null]))

  for (const [phone, titles] of byUser) {
    // ── 找或建立系統對話 ────────────────────────────────
    let convId: string | null = null
    const { data: existingConv } = await sb
      .from('conversations')
      .select('id')
      .eq('user_phone', phone)
      .eq('contact_name', SYSTEM_CONTACT)
      .limit(1)
      .single()

    if (existingConv) {
      convId = existingConv.id

      // ── 防重複：7 天內已通知過則跳過 ──────────────────
      const { data: lastMsg } = await sb
        .from('messages')
        .select('created_at')
        .eq('conversation_id', convId)
        .eq('sender_id', SYSTEM_SENDER)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (lastMsg) {
        const elapsed = Date.now() - new Date(lastMsg.created_at).getTime()
        if (elapsed < NOTIFY_INTERVAL) continue
      }
    } else {
      const { data: newConv } = await sb
        .from('conversations')
        .insert({
          id:           `sys-${phone.slice(-4)}-${Date.now()}`,
          user_phone:   phone,
          contact_name: SYSTEM_CONTACT,
          contact_avatar: '',
        })
        .select('id')
        .single()
      convId = newConv?.id ?? null
    }

    if (!convId) continue

    // ── 發送平台私訊 ────────────────────────────────────
    const count = titles.length
    const msgBody =
      `🌳 提醒您：您有 ${count} 筆票券（${titles.slice(0, 2).join('、')}${count > 2 ? '等' : ''}）` +
      `超過一週尚未兌換樹憑證。請前往「票券 → 查看票券 → 兌換樹憑證」完成兌換，` +
      `每張票對應一棵真實種植的樹！`

    await sb.from('messages').insert({
      conversation_id: convId,
      sender_id:       SYSTEM_SENDER,
      body:            msgBody,
      read:            false,
    })

    // ── 發送 Email（如有填寫） ──────────────────────────
    const email = emailMap.get(phone)
    if (email) {
      const { subject, html } = unclaimedCertTemplate({
        phone,
        orderCount: count,
        eventTitles: titles,
      })
      await sendEmail({ to: email, subject, html })
    }

    notified++
  }

  return NextResponse.json({
    notified,
    scanned: unclaimed.length,
    ts: new Date().toISOString(),
  })
}
