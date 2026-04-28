'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronLeft, CreditCard, Shield, CheckCircle,
  Lock, Clock, Ticket, AlertCircle, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { addStoredOrder, addPoints } from '@/lib/store'

interface CheckoutData {
  eventId: string
  eventTitle: string
  seats: { sectionId: string; sectionName: string; row: string; seatNumber: number; price: number }[]
  total: number
}

type PayStep = 'info' | 'payment' | 'processing' | 'success'

function CountdownTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds)
  useEffect(() => {
    const interval = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000)
    return () => clearInterval(interval)
  }, [])
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const urgent = remaining < 60
  return (
    <span className={`font-mono font-bold ${urgent ? 'text-red-500' : 'text-gray-700'}`}>
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<PayStep>('info')
  const [payMethod, setPayMethod] = useState<'credit' | 'atm' | 'cvs'>('credit')
  const [cardNum, setCardNum] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderId] = useState(`ORD-${Date.now()}`)

  let data: CheckoutData | null = null
  try {
    const raw = searchParams.get('data')
    if (raw) data = JSON.parse(decodeURIComponent(raw))
  } catch {}

  const seats = data?.seats ?? []
  const total = data?.total ?? 0
  const fee = Math.round(total * 0.03)
  const grandTotal = total + fee

  const formatCard = (val: string) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExp = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4)
    return clean.length > 2 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean
  }

  const handlePay = async () => {
    setLoading(true)
    setStep('processing')
    await new Promise(r => setTimeout(r, 2500))

    // Save order to localStorage
    if (data) {
      const ticketCode = `TK-${Date.now().toString(36).toUpperCase()}`
      addStoredOrder({
        id: orderId,
        eventId: data.eventId,
        eventTitle: data.eventTitle,
        eventDate: '待確認',
        eventVenue: '詳見活動頁面',
        seats: seats.map(s => ({ section: s.sectionName, row: s.row, seat: s.seatNumber })),
        totalAmount: grandTotal,
        status: 'paid',
        createdAt: new Date().toISOString().slice(0, 10),
        ticketCode,
      })
      // Earn points: NT$1 = 1 point
      addPoints(total)
    }

    setStep('success')
    setLoading(false)
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">找不到訂單資料</p>
        <Link href="/"><Button>返回首頁</Button></Link>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
          <p className="text-xl font-bold text-gray-900">付款處理中</p>
          <p className="text-gray-500 text-sm">請勿關閉此頁面...</p>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">付款成功！</h2>
            <p className="text-gray-500 text-sm mt-2">訂單編號：<span className="font-mono text-gray-700">{orderId}</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
            <p className="font-medium text-gray-700">{data.eventTitle}</p>
            {seats.map((s, i) => (
              <div key={i} className="flex justify-between text-gray-500">
                <span>{s.sectionName} {s.row}排 {s.seatNumber}號</span>
                <span>NT$ {s.price.toLocaleString()}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-gray-900">
              <span>總金額</span>
              <span>NT$ {grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">電子票券已發送至您的帳號，請至「我的票券」查看</p>
          <div className="flex gap-2">
            <Link href="/tickets" className="flex-1">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <Ticket className="h-4 w-4 mr-1" />
                查看票券
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">返回首頁</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Link href={`/events/${data.eventId}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 mb-6 text-sm">
        <ChevronLeft className="h-4 w-4" />
        返回選位
      </Link>

      {/* Timer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 mb-6">
        <Clock className="h-4 w-4 text-amber-500" />
        <span className="text-sm text-amber-700">
          座位保留時間：<CountdownTimer seconds={600} />
          ，請儘速完成付款
        </span>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-3 space-y-4">
          <h1 className="text-xl font-bold text-gray-900">結帳付款</h1>

          {/* Payment Method */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">選擇付款方式</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { id: 'credit', label: '信用卡 / 金融卡', icon: '', desc: '即時扣款，立即取票' },
                { id: 'atm', label: 'ATM 轉帳', icon: '', desc: '請於 24 小時內完成轉帳' },
                { id: 'cvs', label: '超商付款', icon: '', desc: '7-11 / 全家 / OK / 萊爾富' },
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setPayMethod(method.id as typeof payMethod)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    payMethod === method.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{method.label}</p>
                    <p className="text-xs text-gray-400">{method.desc}</p>
                  </div>
                  {payMethod === method.id && (
                    <div className="ml-auto w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs"></span>
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Credit Card Form */}
          {payMethod === 'credit' && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  信用卡資訊（SSL 加密）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>卡號</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNum}
                    onChange={e => setCardNum(formatCard(e.target.value))}
                    className="font-mono text-lg tracking-widest"
                  />
                </div>
                <div className="space-y-1">
                  <Label>持卡人姓名</Label>
                  <Input
                    placeholder="WANG XIAO MING"
                    value={cardName}
                    onChange={e => setCardName(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>有效期限</Label>
                    <Input
                      placeholder="MM/YY"
                      value={cardExp}
                      onChange={e => setCardExp(formatExp(e.target.value))}
                      maxLength={5}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>安全碼 (CVV)</Label>
                    <Input
                      placeholder="123"
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      maxLength={3}
                      className="font-mono"
                      type="password"
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-center text-xs text-gray-400">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                  <span>您的付款資訊受到 256-bit SSL 加密保護</span>
                </div>
                <div className="flex gap-2">
                  {['VISA', 'MC', 'JCB', '銀聯'].map(brand => (
                    <Badge key={brand} variant="outline" className="text-xs font-mono">{brand}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {payMethod === 'atm' && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-2">
                  <p className="font-medium">ATM 轉帳說明</p>
                  <p>完成訂單後，系統將提供虛擬帳號，請於 <strong>24 小時</strong>內至 ATM 完成轉帳。</p>
                  <p>轉帳完成後，票券將自動發送至您的帳號。</p>
                </div>
              </CardContent>
            </Card>
          )}

          {payMethod === 'cvs' && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="bg-orange-50 rounded-xl p-4 text-sm text-orange-700 space-y-2">
                  <p className="font-medium">超商付款說明</p>
                  <p>完成訂單後，系統將提供繳費代碼，請於 <strong>72 小時</strong>內至超商繳費機完成付款。</p>
                  <p>支援 7-11、全家、OK、萊爾富等超商。</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-md sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">訂單確認</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-bold text-gray-900">{data.eventTitle}</p>
                <p className="text-xs text-gray-400 mt-1">訂單編號：{orderId}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                {seats.map((seat, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{seat.sectionName}</span>
                      <span className="text-gray-400 ml-1 text-xs">{seat.row}排 {seat.seatNumber}號</span>
                    </div>
                    <span>NT$ {seat.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>票券小計</span><span>NT$ {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>手續費 (3%)</span><span>NT$ {fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>總金額</span>
                  <span className="text-emerald-600">NT$ {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base"
                onClick={handlePay}
                disabled={loading || (payMethod === 'credit' && (!cardNum || !cardExp || !cardCvc || !cardName))}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    處理中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    確認付款 NT$ {grandTotal.toLocaleString()}
                  </span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Shield className="h-3.5 w-3.5 text-green-400" />
                <span>由綠界科技提供安全金流服務</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCw className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
