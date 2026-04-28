'use client'
import { useState, useEffect } from 'react'
import { Calendar, MapPin, Ticket, Download, QrCode, Leaf, TreePine, Sprout, Star, Repeat2, CheckCircle2, XCircle, Loader2, ExternalLink, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { mockOrders } from '@/lib/mock-data'
import { Order } from '@/lib/types'
import { useOrders } from '@/lib/store'

// ── Anydeee 跨站兌換 ──────────────────────────────────
// 生產環境改成正式網址；本機開發指向 soul 資料夾
const ANYDEEE_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? `${window.location.origin}/rwa-dex.html`
    : 'https://anydeee.vercel.app/rwa-dex.html'

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

const treeAssets = [
  {
    id: 'T001',
    name: '台灣欒樹 #001',
    event: '2026 念念不忘必有回音 回音樹ESG音樂節',
    date: '2026-05-02',
    location: '南投縣仁愛鄉',
    co2: 12.4,
    status: '健康成長中',
    age: '剛種下',
    emoji: '',
    level: 1,
    certCode: 'TREE-ESG-2026-001',
  },
  {
    id: 'T002',
    name: '台灣杉 #047',
    event: '2025 草東沒有派對巡迴',
    date: '2025-10-05',
    location: '花蓮縣秀林鄉',
    co2: 28.7,
    status: '茁壯成長',
    age: '6 個月',
    emoji: '',
    level: 2,
    certCode: 'TREE-IND-2025-047',
  },
]

function TreeAssetCard({ asset }: { asset: typeof treeAssets[0] }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <Card
      className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => setFlipped(f => !f)}
    >
      <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
      <CardContent className="p-5">
        {!flipped ? (
          /* 正面 */
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-2xl">
                  {asset.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{asset.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: asset.level }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">Lv.{asset.level}</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">
                {asset.status}
              </Badge>
            </div>

            <div className="bg-green-50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700 font-medium">累積固碳</span>
              </div>
              <span className="font-bold text-green-700">{asset.co2} kg CO₂</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {asset.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                樹齡 {asset.age}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">點擊查看來源活動 →</p>
          </div>
        ) : (
          /* 背面 */
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="h-4 w-4 text-emerald-500" />
              <p className="font-bold text-gray-900 text-sm">來源活動</p>
            </div>
            <p className="text-sm text-gray-700 font-medium">{asset.event}</p>
            <p className="text-xs text-gray-400">{asset.date}</p>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">憑證編號</span>
                <span className="font-mono text-gray-700">{asset.certCode}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">樹木狀態</span>
                <span className="text-green-600 font-medium">{asset.status}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">種植地點</span>
                <span className="text-gray-700">{asset.location}</span>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-700 text-center">
               感謝您為地球貢獻了 {asset.co2} kg 固碳量
            </div>

            <p className="text-xs text-gray-400 text-center">點擊返回 ←</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TreeWallet() {
  const totalCo2 = treeAssets.reduce((sum, t) => sum + t.co2, 0)

  return (
    <div className="space-y-4">
      {/* 總覽 */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <TreePine className="h-5 w-5" />
          <span className="font-bold">樹資產總覽</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold">{treeAssets.length}</p>
            <p className="text-green-100 text-xs mt-0.5">棵樹</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalCo2.toFixed(1)}</p>
            <p className="text-green-100 text-xs mt-0.5">kg CO₂ 固碳</p>
          </div>
          <div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-green-100 text-xs mt-0.5">場 ESG 活動</p>
          </div>
        </div>
      </div>

      {/* 說明 */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex gap-2">
        <Sprout className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
        <p className="text-xs text-green-700">
          每購買一張 ESG 活動票券，Echo Goo 將為您種植一棵樹。點擊卡片可查看來源活動與憑證。
        </p>
      </div>

      {/* 樹資產卡片 */}
      <div className="space-y-3">
        {treeAssets.map(asset => (
          <TreeAssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  )
}

export default function TicketsPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [redeemOrder, setRedeemOrder] = useState<Order | null>(null)
  const storedOrders = useOrders()
  // Merge: stored orders first (newest purchases), then mock baseline orders
  const allOrders: Order[] = [...storedOrders, ...mockOrders]
  const now = new Date()
  const upcoming = allOrders.filter(o => new Date(o.eventDate) >= now)

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
          <TreeWallet />
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
