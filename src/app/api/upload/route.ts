// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Upload — POST /api/upload                ║
// ║  [MODULE: Upload] 串流上傳檔案至 Supabase Storage     ║
// ╚══════════════════════════════════════════════════════╝
//
// Accepts:  multipart/form-data { file: File, folder?: string }
// Returns:  { url: string }  — public storage URL stored in the DB
//
// Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) when available;
// falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY (requires bucket policy).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'media'

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string | null) ?? 'uploads'

  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const path = `${folder}/${filename}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const sb = getStorageClient()

  const { data, error } = await sb.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl })
}
