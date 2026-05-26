// ╔══════════════════════════════════════════════════════╗
// ║  SERVER UTIL: Redis cache helper                     ║
// ║  [MODULE: Cache] API 回應快取，Redis 不可用時自動降級  ║
// ╚══════════════════════════════════════════════════════╝
//
// Usage:
//   const cached = await cacheGet<EventList>('events:on-sale')
//   if (cached) return NextResponse.json(cached)
//   ...fetch from DB...
//   await cacheSet('events:on-sale', data, 30)

import Redis from 'ioredis'

let _client: Redis | null = null
let _disabled = false          // set true on first connection failure

function getClient(): Redis | null {
  if (_disabled || !process.env.REDIS_URL) return null
  if (_client) return _client

  _client = new Redis(process.env.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2_000,
    commandTimeout: 1_000,
    enableOfflineQueue: false,
  })

  _client.on('error', () => {
    _disabled = true
    _client?.disconnect()
    _client = null
  })

  return _client
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getClient()
    if (!r) return null
    const raw = await r.get(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 30,
): Promise<void> {
  try {
    const r = getClient()
    if (!r) return
    await r.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // best-effort — never throw from cache layer
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const r = getClient()
    if (!r) return
    await r.del(key)
  } catch {
    // best-effort
  }
}

/**
 * Delete every key matching a glob pattern (e.g. 'forum:*').
 * Uses SCAN instead of KEYS so it never blocks Redis in production.
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const r = getClient()
    if (!r) return
    let cursor = '0'
    const toDelete: string[] = []
    do {
      const [next, keys] = await r.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = next
      toDelete.push(...keys)
    } while (cursor !== '0')
    if (toDelete.length) await r.del(...toDelete)
  } catch {
    // best-effort
  }
}

/** Build a namespaced cache key from parts, e.g. key('events', category, city) */
export function key(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(':')
}
