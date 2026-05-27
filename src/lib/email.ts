// ╔══════════════════════════════════════════════════════╗
// ║  LIB: Email sender via Resend HTTP API               ║
// ║  [MODULE: Notifications] 無需安裝 npm 套件            ║
// ╚══════════════════════════════════════════════════════╝
//
// 使用方式：set RESEND_API_KEY in Vercel env vars
// 發件人網域：需在 Resend 後台驗證 (resend.com/domains)
// 若 RESEND_API_KEY 未設定，自動 skip 並寫 console.log

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Echo Tree <noreply@echotree.app>'

export interface EmailPayload {
  to: string          // 收件人 email
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.log(`[email:skip] RESEND_API_KEY 未設定 → to=${payload.to} subject=${payload.subject}`)
    return { ok: true }   // fail-open: don't block cron flow
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ from: FROM, to: [payload.to], subject: payload.subject, html: payload.html }),
    })
    if (!res.ok) {
      const msg = await res.text()
      console.error(`[email:error] ${res.status} ${msg}`)
      return { ok: false, error: msg }
    }
    return { ok: true }
  } catch (e) {
    console.error('[email:error]', e)
    return { ok: false, error: String(e) }
  }
}

// ── Email templates ────────────────────────────────────
export function unclaimedCertTemplate(opts: {
  phone: string
  orderCount: number
  eventTitles: string[]
}): { subject: string; html: string } {
  const subject = `🌳 您有 ${opts.orderCount} 筆票券尚未兌換樹憑證 — Echo Tree`
  const eventList = opts.eventTitles.map(t => `<li>${t}</li>`).join('')
  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#16a34a,#059669);padding:32px 24px;text-align:center">
      <div style="font-size:48px">🌳</div>
      <h1 style="color:#fff;margin:12px 0 4px;font-size:20px">樹憑證尚未兌換</h1>
      <p style="color:#d1fae5;font-size:13px;margin:0">Echo Tree ESG 通知</p>
    </div>
    <div style="padding:24px">
      <p style="color:#374151;font-size:14px;line-height:1.6">
        您好，您以下票券已超過一週尚未兌換樹憑證：
      </p>
      <ul style="color:#374151;font-size:14px;line-height:2;padding-left:20px">
        ${eventList}
      </ul>
      <p style="color:#374151;font-size:14px;line-height:1.6">
        每張票券對應一棵真實種植的樹。請前往票券頁，點擊「查看票券」後兌換。
      </p>
      <div style="text-align:center;margin:24px 0">
        <a href="https://echotree-5usy.vercel.app/tickets"
           style="background:linear-gradient(135deg,#16a34a,#059669);color:#fff;text-decoration:none;
                  padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:600;display:inline-block">
          前往兌換樹憑證 →
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
        Echo Tree · 每一張票，種一棵樹
      </p>
    </div>
  </div>
</body>
</html>`
  return { subject, html }
}
