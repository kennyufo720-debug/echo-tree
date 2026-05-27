-- ╔══════════════════════════════════════════════════════╗
-- ║  Migration: users — add email column                 ║
-- ║  供廣播通知系統發送 Email                             ║
-- ╚══════════════════════════════════════════════════════╝

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- 唯一性（選填，但若填了不能重複）
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
  ON users (email)
  WHERE email IS NOT NULL;
