import crypto from 'crypto'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export interface VerifiedSession {
  phone: string
  verifiedAt: number
}

export interface CheckoutSeat {
  sectionId: string
  sectionName: string
  row: string
  seatNumber: number
  price: number
}

export interface CheckoutSession {
  eventId: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  seats: CheckoutSeat[]
  total: number
  expiresAt: number
}

function secret(): string {
  const value =
    process.env.AUTH_SECRET ||
    process.env.CHECKOUT_SECRET ||
    process.env.OTP_SECRET ||
    process.env.ADMIN_PASSWORD

  if (value) return value
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is required for signed sessions')
  }
  return 'dev-only-echo-tree-session-secret'
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url')
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function createSignedToken<T extends object>(payload: T): string {
  const encoded = base64url(JSON.stringify(payload))
  return `${encoded}.${sign(encoded)}`
}

export function verifySignedToken<T extends object>(token: string | undefined | null): T | null {
  if (!token || !token.includes('.')) return null
  const [encoded, signature] = token.split('.', 2)
  const expected = sign(encoded)
  const ok =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  if (!ok) return null
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as T
  } catch {
    return null
  }
}

export function verifiedCookie(phone: string): string {
  const token = createSignedToken<VerifiedSession>({ phone, verifiedAt: Date.now() })
  return `echotree_verified=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`
}

export function readVerifiedCookie(cookieHeader: string | null): VerifiedSession | null {
  const token = readCookie(cookieHeader, 'echotree_verified')
  return verifySignedToken<VerifiedSession>(token)
}

export function adminCookie(): string {
  const token = createSignedToken({ admin: true, verifiedAt: Date.now() })
  return `echotree_admin=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/admin; Max-Age=${60 * 60 * 8}`
}

export function readAdminCookie(cookieHeader: string | null): boolean {
  const token = readCookie(cookieHeader, 'echotree_admin')
  const value = verifySignedToken<{ admin: boolean }>(token)
  return value?.admin === true
}

export function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}
