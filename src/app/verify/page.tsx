'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, Shield, CheckCircle, ChevronLeft, RefreshCw, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setUser, addPoints, getUser } from '@/lib/store'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type Step = 'phone' | 'otp' | 'success'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/'
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    if (!/^09\d{8}$/.test(phone)) {
      setError('請輸入正確的手機號碼（09 開頭共 10 碼）')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '發送失敗，請稍後再試')
        setLoading(false)
        return
      }
    } catch {
      setError('網路錯誤，請稍後再試')
      setLoading(false)
      return
    }
    setLoading(false)
    setStep('otp')
    setCountdown(60)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (next.every(v => v)) {
      handleVerify(next.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code?: string) => {
    const finalCode = code ?? otp.join('')
    if (finalCode.length < 6) {
      setError('請輸入完整的 6 位驗證碼')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: finalCode }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '驗證碼錯誤，請重新輸入')
        setLoading(false)
        return
      }
    } catch {
      setError('網路錯誤，請稍後再試')
      setLoading(false)
      return
    }
    setLoading(false)
    setStep('success')
    // Save verified state + bonus points
    const wasVerified = getUser().verified   // capture BEFORE setUser
    setUser({ verified: true, phone })
    if (!wasVerified) addPoints(200)         // first-time KYC +200pts
  }

  const handleResend = async () => {
    setCountdown(60)
    setOtp(['', '', '', '', '', ''])
    setError('')
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 mb-6 text-sm">
          <ChevronLeft className="h-4 w-4" />
          返回
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {['手機號碼', '驗證碼', '完成'].map((label, i) => {
            const stepIndex = ['phone', 'otp', 'success'].indexOf(step)
            const active = i === stepIndex
            const done = i < stepIndex
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    done ? 'bg-emerald-600 text-white' :
                    active ? 'bg-emerald-600 text-white ring-4 ring-emerald-200' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {done ? '' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 ${active || done ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className={`w-16 h-0.5 mx-2 mb-4 ${done ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Phone */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">手機號碼驗證</h2>
                <p className="text-gray-500 text-sm mt-2">輸入您的手機號碼，我們將發送驗證碼</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手機號碼</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-gray-50 border rounded-lg text-sm text-gray-600 font-medium">
                     +886
                  </div>
                  <Input
                    id="phone"
                    placeholder="0912345678"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    maxLength={10}
                    className="flex-1 text-lg tracking-widest"
                  />
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
              </div>

              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 flex gap-2">
                <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                <span>您的手機號碼僅用於購票驗證，不會用於其他用途</span>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base"
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    發送中...
                  </span>
                ) : '發送驗證碼'}
              </Button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">輸入驗證碼</h2>
                <p className="text-gray-500 text-sm mt-2">
                  已發送 6 位數驗證碼至<br />
                  <span className="font-medium text-gray-700">{phone}</span>
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 ${
                      digit ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'
                    } ${error ? 'border-red-300 bg-red-50' : ''}`}
                  />
                ))}
              </div>

              {error && <p className="text-center text-red-500 text-sm">{error}</p>}

              {process.env.NODE_ENV !== 'production' && (
                <p className="text-center text-xs text-gray-400">
                  提示：測試用驗證碼為 <span className="font-mono font-bold text-emerald-600">123456</span>
                </p>
              )}

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base"
                onClick={() => handleVerify()}
                disabled={loading || otp.some(v => !v)}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    驗證中...
                  </span>
                ) : '確認驗證'}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => setStep('phone')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  更換號碼
                </button>
                {countdown > 0 ? (
                  <span className="text-gray-400">{countdown}s 後可重發</span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    重新發送
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">驗證成功！</h2>
                <p className="text-gray-500 text-sm mt-2">
                  手機號碼 <span className="font-medium text-gray-700">{phone}</span> 已完成驗證
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700">
                您現在可以購買演唱會票券了 
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => router.push(redirectTo)}
                >
                  {redirectTo !== '/' ? '繼續購票' : '開始購票'}
                </Button>
                <Link href="/tickets">
                  <Button variant="outline" className="w-full">
                    查看我的票券
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
      <VerifyContent />
    </Suspense>
  )
}
