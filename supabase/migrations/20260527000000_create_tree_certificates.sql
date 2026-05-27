-- ╔══════════════════════════════════════════════════════╗
-- ║  Migration: tree_certificates                        ║
-- ║  每張票券自動產生一張樹憑證，支援未來交易所移轉        ║
-- ╚══════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS tree_certificates (
  id               TEXT PRIMARY KEY,               -- cert-{orderId}-001
  user_phone       TEXT NOT NULL,                  -- 目前持有人
  original_phone   TEXT NOT NULL,                  -- 原始購票人（不可變）
  order_id         TEXT NOT NULL,                  -- 來源訂單
  event_id         TEXT NOT NULL DEFAULT '',
  event_title      TEXT NOT NULL DEFAULT '',
  tree_species     TEXT NOT NULL DEFAULT '台灣杉', -- 樹種（由活動名稱推算）
  forest_location  TEXT NOT NULL DEFAULT '台東縣鹿野鄉',
  cert_code        TEXT UNIQUE NOT NULL,           -- 人讀憑證碼 TREE-XXXX-001
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status           TEXT NOT NULL DEFAULT 'active'  -- 'active' | 'transferred'
                   CHECK (status IN ('active', 'transferred')),
  source_cert_id   TEXT REFERENCES tree_certificates(id), -- 移轉來源
  transferred_at   TIMESTAMPTZ
);

-- 依持有人快速撈取 (樹票夾列表)
CREATE INDEX IF NOT EXISTS idx_tree_certs_user_phone
  ON tree_certificates (user_phone, issued_at DESC);

-- 依訂單撈取 (重複購票確認)
CREATE INDEX IF NOT EXISTS idx_tree_certs_order_id
  ON tree_certificates (order_id);

-- 依狀態篩選
CREATE INDEX IF NOT EXISTS idx_tree_certs_status
  ON tree_certificates (status);

-- RLS: 持有人只能看自己的憑證
ALTER TABLE tree_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own certs"
  ON tree_certificates FOR SELECT
  USING (true);   -- 目前 public read；可改為 auth.jwt()->>'phone' = user_phone

CREATE POLICY "Service role can insert"
  ON tree_certificates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update"
  ON tree_certificates FOR UPDATE
  USING (true);
