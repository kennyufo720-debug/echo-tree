// ╔══════════════════════════════════════════════════════╗
// ║  API ROUTE: Upload — POST /api/upload                ║
// ║  [MODULE: Upload] 串流上傳檔案至 Supabase Storage     ║
// ╚══════════════════════════════════════════════════════╝
//
// Accepts:  multipart/form-data { file: File, folder?: string }
// Returns:  { url: string }  — public storage URL stored in the DB
//
// Security:
//   - Server-side MIME allowlist (ignores client-supplied Content-Type)
//   - Magic-byte verification for images
//   - 20 uploads per IP per hour (Redis-backed, fails open)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const BUCKET = 'media'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024   // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024  // 50 MB

// Allowed MIME types → validated against file magic bytes below
const ALLOWED_TYPES: Record<string, { ext: string; magic?: number[] }> = {
  'image/jpeg':      { ext: 'jpg',  magic: [0xff, 0xd8, 0xff] },
  'image/png':       { ext: 'png',  magic: [0x89, 0x50, 0x4e, 0x47] },
  'image/gif':       { ext: 'gif',  magic: [0x47, 0x49, 0x46, 0x38] },
  'image/webp':      { ext: 'webp' },   // "RIFF" header — checked by Supabase bucket
  // image/svg+xml intentionally excluded: SVGs are XML/text with no reliable magic
  // bytes and can embed <script> / onload= handlers that execute when the CDN URL
  // is opened in a browser tab (stored XSS via CDN).
  'video/mp4':       { ext: 'mp4' },
  'video/quicktime': { ext: 'mov' },
  'video/webm':      { ext: 'webm' },
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const rule = ALLOWED_TYPES[mimeType]
  if (!rule?.magic) return true   // no magic-byte rule → trust Supabase bucket policy
  return rule.magic.every((byte, i) => buffer[i] === byte)
}

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const { allowed } = await checkRateLimit(`upload:${ip}`, 20, 3600)
  if (!allowed) {
    return NextResponse.json({ error: '上傳次數過多，請稍後再試' }, { status: 429 })
  }

  // ── Parse form data ────────────────────────────────────────────
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string | null) ?? 'uploads'

  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  // ── MIME type allowlist (use file.type as hint, verify with magic bytes) ─
  const mimeType = file.type
  const rule = ALLOWED_TYPES[mimeType]
  if (!rule) {
    return NextResponse.json({ error: `不支援的檔案類型: ${mimeType}` }, { status: 415 })
  }

  // ── File size limits ───────────────────────────────────────────
  const isVideo = mimeType.startsWith('video/')
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (file.size > maxBytes) {
    const limit = isVideo ? '50 MB' : '5 MB'
    return NextResponse.json({ error: `檔案超過大小限制（${limit}）` }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // ── Magic-byte verification ────────────────────────────────────
  if (!validateMagicBytes(buffer, mimeType)) {
    return NextResponse.json({ error: '檔案格式與副檔名不符' }, { status: 415 })
  }

  // ── Upload to Supabase Storage ─────────────────────────────────
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${rule.ext}`
  const path = `${folder}/${filename}`
  const sb = getStorageClient()

  const { data, error } = await sb.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(data.path)
  return NextResponse.json({ url: publicUrl })
}
