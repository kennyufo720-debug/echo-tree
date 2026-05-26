-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Migration: 20260526000001_create_media_bucket               ║
-- ║  Purpose  : Create public Supabase Storage bucket for        ║
-- ║             user-uploaded images and videos                   ║
-- ╚══════════════════════════════════════════════════════════════╝
--
-- Run AFTER 20260526000000_add_performance_indexes.sql
-- Safe to re-run: ON CONFLICT DO NOTHING / IF NOT EXISTS.
--
-- NOTE: If you add SUPABASE_SERVICE_ROLE_KEY to your env, the API
-- route bypasses RLS entirely and these policies are not needed.
-- They are included as a fallback for the anon key path.

-- ── Create the bucket (public = URLs are readable without auth) ──
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,       -- 50 MB max per file
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── RLS policies on storage.objects ─────────────────────────────
-- Allow anyone to upload (anon key path from API routes)
CREATE POLICY "media_public_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media');

-- Allow anyone to read (bucket is already public, but policy is also required)
CREATE POLICY "media_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');
