'use client'
import { useState, useEffect, useCallback } from 'react'
import { Order } from './types'

// ── Keys ──────────────────────────────────────────────────
const ORDERS_KEY = 'echotree_orders'
const USER_KEY   = 'echotree_user'
const EVENT_NAME = 'echotree:updated'

// ── User state ────────────────────────────────────────────
export interface UserState {
  verified: boolean
  phone: string
  points: number
  email: string
}

const DEFAULT_USER: UserState = { verified: false, phone: '', points: 2450, email: '' }

export function getUser(): UserState {
  if (typeof window === 'undefined') return DEFAULT_USER
  try { return { ...DEFAULT_USER, ...JSON.parse(localStorage.getItem(USER_KEY) ?? '{}') } }
  catch { return DEFAULT_USER }
}

export function setUser(updates: Partial<UserState>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify({ ...getUser(), ...updates }))
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function addPoints(pts: number): void {
  setUser({ points: getUser().points + pts })
}

// ── Orders ────────────────────────────────────────────────
export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]') }
  catch { return [] }
}

export function addStoredOrder(order: Order): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...getStoredOrders()]))
  window.dispatchEvent(new Event(EVENT_NAME))
}

// ── Session video store (in-memory, not persisted) ───────
// Object URLs are valid for the lifetime of the document.
// We keep them in a module-level Map so any page can look up a video by postId.
const _sessionVideos = new Map<string, string>()
const VIDEO_EVENT = 'echotree:video'

export function setSessionVideo(postId: string, objectUrl: string): void {
  // BUG-16 fix: revoke the previous URL for this post to prevent memory leak
  const prev = _sessionVideos.get(postId)
  if (prev && prev !== objectUrl) URL.revokeObjectURL(prev)
  _sessionVideos.set(postId, objectUrl)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(VIDEO_EVENT, { detail: postId }))
}

export function getSessionVideo(postId: string): string | undefined {
  return _sessionVideos.get(postId)
}

export function useSessionVideo(postId: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() => _sessionVideos.get(postId))
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === postId) setUrl(_sessionVideos.get(postId))
    }
    window.addEventListener(VIDEO_EVENT, handler)
    return () => window.removeEventListener(VIDEO_EVENT, handler)
  }, [postId])
  return url
}

// ── React hooks ───────────────────────────────────────────
export function useUser() {
  const [user, setUserState] = useState<UserState>(DEFAULT_USER)
  const refresh = useCallback(() => setUserState(getUser()), [])
  useEffect(() => {
    refresh()
    window.addEventListener(EVENT_NAME, refresh)
    return () => window.removeEventListener(EVENT_NAME, refresh)
  }, [refresh])
  return user
}

export function useOrders(): Order[] {
  const [orders, setOrders] = useState<Order[]>([])
  const refresh = useCallback(() => setOrders(getStoredOrders()), [])
  useEffect(() => {
    refresh()
    window.addEventListener(EVENT_NAME, refresh)
    return () => window.removeEventListener(EVENT_NAME, refresh)
  }, [refresh])
  return orders
}

export function useTicketCount(): number {
  const [count, setCount] = useState(0)
  const refresh = useCallback(() => {
    // BUG-13 fix: removed hardcoded +2; tickets page merges mockOrders separately
    const stored = getStoredOrders().filter(o => o.status === 'paid').length
    setCount(stored)
  }, [])
  useEffect(() => {
    refresh()
    window.addEventListener(EVENT_NAME, refresh)
    return () => window.removeEventListener(EVENT_NAME, refresh)
  }, [refresh])
  return count
}
