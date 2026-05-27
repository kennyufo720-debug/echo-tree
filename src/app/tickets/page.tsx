'use client'
import { useState, useEffect } from 'react'
import { Calendar, MapPin, Ticket, Download, QrCode, Leaf, TreePine, Sprout, Star, Repeat2, CheckCircle2, XCircle, Loader2, ExternalLink, Copy, Check, ArrowRightLeft, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Order } from '@/lib/types'
import { useOrders, useUser } from '@/lib/store'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToOrder(r: Record<string, any>): Order {
  return {
    id: r.id,
    eventId: r.event_id ?? '',
    eventTitle: r.event_title ?? '',
    eventDate: r.event_date ?? '',
    eventVenue: r.event_venue ?? '',
    seats: r.seats ?? [],
    totalAmount: r.total_amount ?? 0,
    status: r.status ?? 'paid',
    createdAt: r.created_at?.slice(0, 10) ?? '',
    ticketCode: r.ticket_code ?? '',
  }
}

// ── Anydeee 跨站兌換 ──────────────────────────────────
// BUG-22 fix: 避免 module-level window 存取造成 SSR hydration mismatch
const ANYDEEE_BASE_URL = 'https://anydeee.vercel.app/rwa-dex.html'

/** 依票券事件挑選對應樹種 */
function pickTreeSym(eventTitle: string): string {
  if (/ESG|森林|永續/i.test(eventTitle))  return 'CYPRS'   // 台灣扁柏
  if (/台灣|回音樹/i.test(eventTitle))     return 'HINOKI'  // 台灣扁柏（另種）
  return 'SUGI'                                              // 日本柳杉（通用）
}

interface AnydeeeRedeemResult {
  success: boolean
  assetId?: string
  anydeeeUrl?: string
  error?: string
}

/**
 * 產生 Anydeee 兌換 URL 並在新分頁開啟。
 * 附帶 btoa 簽章讓 Anydeee 端做基本完整性驗證。
 */
async function redeemToAnydeee(
  orderId: string,
  treeCount: number,
  eventTitle: string
): Promise<AnydeeeRedeemResult> {
  await new Promise(r => setTimeout(r, 900))   // UX loading 感
  try {
    const treeSym  = pickTreeSym(eventTitle)
    const ts       = String(Math.floor(Date.now() / 1000))
    const sig      = btoa([orderId, treeCount, treeSym, ts].join('|') + '|ET2026')
                       .replace(/=/g, '')
    const params   = new URLSearchParams({
      action: 'echotree_claim',
      orderId,
      treeCount: String(treeCount),
      eventTitle,
      treeSym,
      ts,
      sig,
    })
    const anydeeeUrl = `${ANYDEEE_BASE_URL}?${params.toString()}`
    window.open(anydeeeUrl, '_blank', 'noopener,noreferrer')
    const assetId = `ECT-${orderId}-${Date.now().toString(36).toUpperCase()}`
    return { success: true, assetId, anydeeeUrl }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

// ── Redeem Modal ───────────────────────────────────────
type RedeemStep = 'confirm' | 'loading' | 'success' | 'error'

function RedeemModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [step, setStep] = useState<RedeemStep>('confirm')
  const [result, setResult] = useState<AnydeeeRedeemResult | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleRedeem() {
    setStep('loading')
    const res = await redeemToAnydeee(order.id, order.seats.length, order.eventTitle)
    setResult(res)
    setStep(res.success ? 'success' : 'error')
  }

  function copyTx() {
    const text = result?.anydeeeUrl ?? ''
    if (text) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-emerald-600" />
            樹資產兌換至 Anydeee
          </DialogTitle>
        </DialogHeader>

        {/* Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl"></div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{order.eventTitle}</p>
                  <p className="text-xs text-gray-500">訂單 {order.id}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-400">可兌換樹資產</p>
                  <p className="font-bold text-emerald-600">{order.seats.length} 棵 </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">目標平台</p>
                  <p className="font-bold text-gray-700 flex items-center gap-1">
                    Anydeee <ExternalLink className="h-3 w-3" />
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              兌換後，樹資產憑證將轉入您的 Anydeee 帳戶。此操作不可撤銷。
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>取消</Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleRedeem}>
                <Repeat2 className="h-4 w-4 mr-1.5" />確認兌換
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 text-emerald-500 mx-auto animate-spin" />
            <div>
              <p className="font-semibold text-gray-900">正在產生兌換憑證...</p>
              <p className="text-sm text-gray-400 mt-1">即將跳轉至 Anydeee</p>
            </div>
            <div className="flex justify-center gap-1 mt-2">
              {['驗證票券', '簽署憑證', '開啟 Anydeee'].map((s, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && result && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-3" />
              <p className="text-lg font-bold text-gray-900">兌換頁面已開啟！</p>
              <p className="text-sm text-gray-400 mt-1">Anydeee 已在新分頁開啟，請連接錢包完成領取</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">憑證 ID</span>
                <span className="font-mono font-bold text-emerald-600 text-xs">{result.assetId}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-500 shrink-0">兌換連結</span>
                <button
                  onClick={copyTx}
                  className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 min-w-0"
                >
                  <span className="truncate max-w-[140px]">點擊複製連結</span>
                  {copied ? <Check className="h-3 w-3 shrink-0" /> : <Copy className="h-3 w-3 shrink-0" />}
                </button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              若新分頁未自動開啟，請點擊下方按鈕手動前往 Anydeee 完成錢包連接與 NFT 領取。
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>完成</Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => result.anydeeeUrl && window.open(result.anydeeeUrl, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />前往 Anydeee
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <XCircle className="h-14 w-14 text-red-400 mx-auto mb-3" />
              <p className="text-lg font-bold text-gray-900">兌換失敗</p>
              <p className="text-sm text-red-500 mt-1">{result?.error ?? '連線逾時，請稍後再試'}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>取消</Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setStep('confirm')}>
                重試
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function QRCodeDisplay({ value }: { value: string }) {
  const [qrUrl, setQrUrl] = useState('')
  useEffect(() => {
    const size = 200
    const encoded = encodeURIComponent(value)
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`)
  }, [value])
  return qrUrl ? (
    <img src={qrUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl shadow-sm" />
  ) : (
    <div className="w-48 h-48 mx-auto rounded-xl bg-gray-100 flex items-center justify-center">
      <QrCode className="h-12 w-12 text-gray-300" />
    </div>
  )
}

function TicketCard({ order, onView, onRedeem, isPastTab }: { order: Order; onView: (order: Order) => void; onRedeem?: (order: Order) => void; isPastTab?: boolean }) {
  const isPast = new Date(order.eventDate) < new Date()
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className={`h-1.5 ${order.status === 'paid' ? 'bg-emerald-500' : order.status === 'cancelled' ? 'bg-gray-300' : 'bg-yellow-400'}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">{order.eventTitle}</h3>
              {isPast && <Badge variant="secondary" className="text-xs">已結束</Badge>}
              {!isPast && order.status === 'paid' && (
                <Badge className="bg-green-50 text-green-600 border border-green-200 text-xs">有效</Badge>
              )}
            </div>
            <p className="text-xs text-gray-400">訂單 {order.id}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-emerald-600">NT$ {order.totalAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{order.seats.length} 張票</p>
          </div>
        </div>

        <div className="flex gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {order.eventDate}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {order.eventVenue}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {order.seats.map((seat, i) => (
            <div key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-lg font-medium">
              {seat.section} {seat.row}排 {seat.seat}號
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onView(order)}
          >
            <QrCode className="h-3.5 w-3.5 mr-1" />
            查看票券
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-3.5 w-3.5 mr-1" />
            下載
          </Button>
          {isPastTab && onRedeem && (
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 mt-1"
              onClick={() => onRedeem(order)}
            >
              <TreePine className="h-3.5 w-3.5 mr-1.5" />
              樹資產兌換至 Anydeee
              <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TicketModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>電子票券</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-bold text-lg">{order.eventTitle}</h3>
            <p className="text-gray-500 text-sm">{order.eventDate}</p>
            <p className="text-gray-500 text-sm">{order.eventVenue}</p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4">
            <QRCodeDisplay value={order.ticketCode} />
            <p className="text-center text-xs text-gray-400 mt-3 font-mono">{order.ticketCode}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            {order.seats.map((seat, i) => (
              <div key={i} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-600">{seat.section}</span>
                <span className="font-medium">{seat.row}排 {seat.seat}號</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            入場時請出示此 QR Code，每張票限掃描一次
          </div>

          <Button className="w-full" variant="outline" onClick={onClose}>關閉</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Tree Certificate types ─────────────────────────────
interface TreeCert {
  id: string
  user_phone: string
  original_phone: string
  order_id: string
  event_id: string
  event_title: string
  tree_species: string
  forest_location: string
  cert_code: string
  issued_at: string
  status: string
  source_cert_id: string | null
  co2_kg: number
}

function speciesEmoji(species: string): string {
  if (species.includes('扁柏') || species.includes('梅'))  return ''
  if (species.includes('欒樹') || species.includes('楓香')) return ''
  if (species.includes('光蠟'))                             return ''
  return ''
}

function treeAge(issuedAt: string): string {
  const days = Math.floor((Date.now() - new Date(issuedAt).getTime()) / 86_400_000)
  if (days < 30)  return `${days} 天`
  if (days < 365) return `${Math.floor(days / 30)} 個月`
  return `${Math.floor(days / 365)} 年`
}

// ── Transfer Modal ─────────────────────────────────────
type TransferStep = 'input' | 'confirm' | 'loading' | 'success' | 'error'

function TransferModal({ cert, phone, onClose }: { cert: TreeCert; phone: string; onClose: () => void }) {
  const [step, setStep]         = useState<TransferStep>('input')
  const [toPhone, setToPhone]   = useState('')
  const [errMsg, setErrMsg]     = useState('')

  async function handleTransfer() {
    setStep('loading')
    try {
      const res = await fetch('/api/certificates/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cert_id: cert.id, from_phone: phone, to_phone: toPhone }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error ?? '移轉失敗'); setStep('error'); return }
      setStep('success')
    } catch {
      setErrMsg('網路錯誤，請稍後再試')
      setStep('error')
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
            移轉樹憑證
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-2xl p-4 space-y-2 text-sm">
              <p className="font-bold text-gray-900">{cert.tree_species} {speciesEmoji(cert.tree_species)}</p>
              <p className="text-xs text-gray-500">{cert.cert_code}</p>
              <p className="text-xs text-gray-500">{cert.event_title}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />接收人手機號碼
              </label>
              <input
                type="tel"
                placeholder="09xxxxxxxx"
                maxLength={10}
                value={toPhone}
                onChange={e => { setToPhone(e.target.value); setErrMsg('') }}
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
              />
              {errMsg && <p className="text-xs text-red-500">{errMsg}</p>}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              移轉後此憑證將從您的票夾移除，且操作不可撤銷。
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>取消</Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!/^09\d{8}$/.test(toPhone)}
                onClick={() => setStep('confirm')}
              >下一步</Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-500">確認移轉給</p>
              <p className="text-xl font-bold text-gray-900">{toPhone}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
              此操作不可撤銷！確認後憑證將立即轉移。
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('input')}>返回</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleTransfer}>
                確認移轉
              </Button>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="h-10 w-10 text-emerald-500 mx-auto animate-spin" />
            <p className="text-sm text-gray-500">移轉中...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-3" />
              <p className="text-lg font-bold text-gray-900">移轉成功！</p>
              <p className="text-sm text-gray-400 mt-1">憑證已移轉至 {toPhone}</p>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onClose}>完成</Button>
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <XCircle className="h-14 w-14 text-red-400 mx-auto mb-3" />
              <p className="text-lg font-bold text-gray-900">移轉失敗</p>
              <p className="text-sm text-red-500 mt-1">{errMsg}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>關閉</Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setStep('input')}>重試</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Tree Cert Card ─────────────────────────────────────
function TreeAssetCard({ cert, phone, onTransfer }: { cert: TreeCert; phone: string; onTransfer: (c: TreeCert) => void }) {
  const [flipped, setFlipped] = useState(false)
  const emoji = speciesEmoji(cert.tree_species)
  const age   = treeAge(cert.issued_at)

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
      <CardContent className="p-5">
        <div
          className="cursor-pointer"
          onClick={() => setFlipped(f => !f)}
        >
          {!flipped ? (
            /* 正面 */
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-2xl">
                    {emoji}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{cert.tree_species}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-400 ml-0.5">樹齡 {age}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">健康成長中</Badge>
              </div>

              <div className="bg-green-50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700 font-medium">累積固碳</span>
                </div>
                <span className="font-bold text-green-700">{cert.co2_kg} kg CO₂</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{cert.forest_location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {cert.issued_at.slice(0, 10)}
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">點擊查看憑證詳情 →</p>
            </div>
          ) : (
            /* 背面 */
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Ticket className="h-4 w-4 text-emerald-500" />
                <p className="font-bold text-gray-900 text-sm">來源活動</p>
              </div>
              <p className="text-sm text-gray-700 font-medium">{cert.event_title}</p>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">憑證編號</span>
                  <span className="font-mono text-gray-700 text-[10px]">{cert.cert_code}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">原始購買人</span>
                  <span className="text-gray-700">{cert.original_phone.replace(/(\d{4})\d{3}(\d{3})/, '$1***$2')}</span>
                </div>
                {cert.source_cert_id && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">取得方式</span>
                    <span className="text-blue-600">移轉取得</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">種植地點</span>
                  <span className="text-gray-700">{cert.forest_location}</span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-700 text-center">
                感謝您為地球貢獻了 {cert.co2_kg} kg 固碳量
              </div>
              <p className="text-xs text-gray-400 text-center">點擊返回 ←</p>
            </div>
          )}
        </div>

        {/* 移轉按鈕 — 固定在卡片底部，不觸發翻面 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            onClick={e => { e.stopPropagation(); onTransfer(cert) }}
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
            移轉此憑證
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Tree Wallet ────────────────────────────────────────
function TreeWallet({ phone }: { phone: string }) {
  const [certs, setCerts]           = useState<TreeCert[]>([])
  const [loading, setLoading]       = useState(true)
  const [transferCert, setTransferCert] = useState<TreeCert | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!phone) { setLoading(false); return }
    setLoading(true)
    fetch(`/api/certificates?phone=${encodeURIComponent(phone)}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setCerts(data) : null)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [phone, refreshKey])

  const totalCo2   = certs.reduce((s, c) => s + c.co2_kg, 0)
  const eventCount = new Set(certs.map(c => c.event_id).filter(Boolean)).size

  function handleTransferDone() {
    setTransferCert(null)
    setRefreshKey(k => k + 1)   // re-fetch after successful transfer
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="h-8 w-8 text-emerald-400 mx-auto animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 總覽 */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <TreePine className="h-5 w-5" />
          <span className="font-bold">樹憑證票夾</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold">{certs.length}</p>
            <p className="text-green-100 text-xs mt-0.5">張憑證</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalCo2.toFixed(1)}</p>
            <p className="text-green-100 text-xs mt-0.5">kg CO₂ 固碳</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{eventCount}</p>
            <p className="text-green-100 text-xs mt-0.5">場 ESG 活動</p>
          </div>
        </div>
      </div>

      {/* 說明 */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex gap-2">
        <Sprout className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
        <p className="text-xs text-green-700">
          每購買一張票券，Echo Tree 將為您種植一棵樹並核發憑證。憑證可移轉給他人，未來亦可掛牌交易所。
        </p>
      </div>

      {/* 空狀態 */}
      {certs.length === 0 ? (
        <div className="text-center py-14 text-gray-400">
          <TreePine className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">尚無樹憑證</p>
          <p className="text-xs mt-1">購票後憑證將自動出現在此</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map(cert => (
            <TreeAssetCard
              key={cert.id}
              cert={cert}
              phone={phone}
              onTransfer={setTransferCert}
            />
          ))}
        </div>
      )}

      {transferCert && (
        <TransferModal
          cert={transferCert}
          phone={phone}
          onClose={handleTransferDone}
        />
      )}
    </div>
  )
}

export default function TicketsPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [redeemOrder, setRedeemOrder] = useState<Order | null>(null)
  const storedOrders = useOrders()
  const user = useUser()
  const [apiOrders, setApiOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!user.phone) return
    fetch(`/api/orders?phone=${encodeURIComponent(user.phone)}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setApiOrders(data.map(dbToOrder)) : null)
      .catch(() => {})
  }, [user.phone])

  // API orders take precedence; fall back to localStorage + empty baseline
  const allOrders: Order[] = apiOrders.length > 0 ? apiOrders : storedOrders
  const now = new Date()
  // BUG-04 fix: '待確認' is not a valid date → treat as upcoming
  const upcoming = allOrders.filter(o => {
    const d = new Date(o.eventDate)
    return isNaN(d.getTime()) ? true : d >= now
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-xl">
          <Ticket className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的票券</h1>
          <p className="text-sm text-gray-400">共 {allOrders.length} 筆訂單</p>
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full mb-5">
          <TabsTrigger value="upcoming" className="flex-1">
            即將到來 ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            歷史票券 ({allOrders.length})
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex-1">
             樹資產票夾
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>目前沒有即將到來的活動</p>
            </div>
          ) : (
            upcoming.map(order => (
              <TicketCard key={order.id} order={order} onView={setSelectedOrder} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {allOrders.map(order => (
            <TicketCard key={order.id} order={order} onView={setSelectedOrder} onRedeem={setRedeemOrder} isPastTab />
          ))}
        </TabsContent>

        <TabsContent value="tree">
          <TreeWallet phone={user.phone} />
        </TabsContent>
      </Tabs>

      {selectedOrder && (
        <TicketModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
      {redeemOrder && (
        <RedeemModal order={redeemOrder} onClose={() => setRedeemOrder(null)} />
      )}
    </div>
  )
}
