import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy init — 只在 runtime 呼叫時才建立，build time 不會報錯
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not set')
  _client = createClient(url, key)
  return _client
}
