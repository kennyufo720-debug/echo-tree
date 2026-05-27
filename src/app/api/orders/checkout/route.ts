import { NextRequest, NextResponse } from 'next/server'
import { CheckoutSession, verifySignedToken } from '@/lib/security/session'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('session')
  const checkout = verifySignedToken<CheckoutSession>(token)
  if (!checkout || checkout.expiresAt < Date.now()) {
    return NextResponse.json({ error: 'INVALID_CHECKOUT_SESSION' }, { status: 400 })
  }
  return NextResponse.json(checkout)
}
