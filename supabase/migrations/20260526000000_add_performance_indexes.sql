-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Migration: 20260526000000_add_performance_indexes           ║
-- ║  Purpose  : Optimize read speed based on actual query        ║
-- ║             patterns found in /src/app/api/**               ║
-- ╚══════════════════════════════════════════════════════════════╝
--
-- Run in Supabase Dashboard → SQL Editor, or via:
--   supabase db push
--
-- Safe to re-run: all statements use CREATE/DROP IF EXISTS.

-- ── Prerequisite: trigram extension for ILIKE search ──────────────────────
-- Required by: GET /api/forum?search= (forum_posts.title ILIKE '%q%')
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ── events ────────────────────────────────────────────────────────────────
-- Query: GET /api/events?category=&city=&status=  ORDER BY date ASC
-- All three filters are optional; every query ends with ORDER BY date.

-- Covers full-table list (no filters)
CREATE INDEX IF NOT EXISTS idx_events_date
  ON events(date ASC);

-- Covers single-filter combos with sort
CREATE INDEX IF NOT EXISTS idx_events_category_date
  ON events(category, date ASC);

CREATE INDEX IF NOT EXISTS idx_events_city_date
  ON events(city, date ASC);

CREATE INDEX IF NOT EXISTS idx_events_status_date
  ON events(status, date ASC);


-- ── artist_forests ────────────────────────────────────────────────────────
-- Query: GET /api/forest  ORDER BY rank ASC
CREATE INDEX IF NOT EXISTS idx_forests_rank
  ON artist_forests(rank ASC);


-- ── forum_posts ───────────────────────────────────────────────────────────
-- Query: GET /api/forum  ORDER BY pinned DESC, created_at DESC
-- Query: GET /api/forum?category=X  (same sort)
-- Query: GET /api/forum?search=X  (ILIKE on title)

-- idx_forum_pinned(pinned, hot) from schema.sql is superseded below.
-- It lacks created_at so Postgres can't use it for the ORDER BY.
DROP INDEX IF EXISTS idx_forum_pinned;
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned_created
  ON forum_posts(pinned DESC, created_at DESC);

-- idx_forum_category(category) from schema.sql is superseded below.
-- Leading category column lets Postgres skip to the right category
-- then satisfy the sort from index order — no heap sort step needed.
DROP INDEX IF EXISTS idx_forum_category;
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_created
  ON forum_posts(category, pinned DESC, created_at DESC);

-- GIN trigram index for case-insensitive substring title search.
-- Without this, ILIKE '%q%' does a full sequential scan.
CREATE INDEX IF NOT EXISTS idx_forum_posts_title_trgm
  ON forum_posts USING gin(title gin_trgm_ops);


-- ── forum_comments ────────────────────────────────────────────────────────
-- Query: GET /api/forum/[id]/comments  WHERE post_id=? ORDER BY created_at ASC
-- Composite index satisfies both the equality filter and the sort.
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_created
  ON forum_comments(post_id, created_at ASC);


-- ── messages ──────────────────────────────────────────────────────────────
-- Query: GET /api/messages/[id]  WHERE conversation_id=? ORDER BY created_at ASC
-- idx_messages_conv(conversation_id) from schema.sql exists but forces a
-- post-index sort step because it has no created_at column. Replace it.
DROP INDEX IF EXISTS idx_messages_conv;
CREATE INDEX IF NOT EXISTS idx_messages_conv_created
  ON messages(conversation_id, created_at ASC);

-- Partial index for unread count (unchanged — already optimal)
-- idx_messages_unread ON messages(conversation_id, read) WHERE read = false


-- ── orders ────────────────────────────────────────────────────────────────
-- Query: GET /api/orders?phone=X  WHERE user_phone=? ORDER BY created_at DESC
-- Upgrade single-column idx_orders_user → composite with created_at.
DROP INDEX IF EXISTS idx_orders_user;
CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON orders(user_phone, created_at DESC);


-- ── point_transactions ────────────────────────────────────────────────────
-- Query: GET /api/points?phone=X  WHERE user_phone=? ORDER BY created_at DESC LIMIT 50
-- Upgrade idx_point_tx_user → composite; Postgres can satisfy LIMIT 50
-- by stopping after 50 index rows instead of sorting the full result set.
DROP INDEX IF EXISTS idx_point_tx_user;
CREATE INDEX IF NOT EXISTS idx_point_tx_user_created
  ON point_transactions(user_phone, created_at DESC);


-- ── store_orders ──────────────────────────────────────────────────────────
-- Query: GET /api/store/orders?phone=X  WHERE user_phone=? ORDER BY created_at DESC
DROP INDEX IF EXISTS idx_store_user;
CREATE INDEX IF NOT EXISTS idx_store_orders_user_created
  ON store_orders(user_phone, created_at DESC);


-- ── conversations ─────────────────────────────────────────────────────────
-- Query: GET /api/messages?phone=X  WHERE user_phone=? ORDER BY created_at DESC
DROP INDEX IF EXISTS idx_conv_user;
CREATE INDEX IF NOT EXISTS idx_conv_user_created
  ON conversations(user_phone, created_at DESC);


-- ── reward_items ──────────────────────────────────────────────────────────
-- Query: GET /api/store  WHERE stock > 0 ORDER BY popular DESC
-- Partial index only covers rows where stock > 0, matching the WHERE clause
-- exactly. Rows with stock = 0 are never included and not indexed.
CREATE INDEX IF NOT EXISTS idx_reward_items_available_popular
  ON reward_items(popular DESC)
  WHERE stock > 0;
