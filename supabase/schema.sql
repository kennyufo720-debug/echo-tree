-- ╔══════════════════════════════════════════════════════════════╗
-- ║         Echo Tree 回音樹 — Supabase Database Schema          ║
-- ║   執行方式：Supabase Dashboard → SQL Editor → Run this file   ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── Extensions ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 1. Users（使用者）────────────────────────────────────────
create table if not exists users (
  id          uuid primary key default uuid_generate_v4(),
  phone       text unique not null,
  verified    boolean default false,
  points      integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── 2. Events（演唱會活動）───────────────────────────────────
create table if not exists events (
  id               text primary key,
  title            text not null,
  artist           text not null,
  venue            text not null,
  city             text not null,
  date             text not null,
  time             text not null,
  image            text not null,
  category         text not null,
  price_from       integer not null,
  price_to         integer not null,
  total_seats      integer not null,
  available_seats  integer not null,
  status           text not null default 'on-sale',
  tags             text[] default '{}',
  video_id         text,
  image_position   text,
  created_at       timestamptz default now()
);

-- ── 3. Seat Sections（座位區）────────────────────────────────
create table if not exists seat_sections (
  id              text primary key,
  event_id        text references events(id) on delete cascade,
  name            text not null,
  color           text not null,
  price           integer not null,
  total_seats     integer not null,
  available_seats integer not null,
  created_at      timestamptz default now()
);

-- ── 4. Orders（票券訂單）─────────────────────────────────────
create table if not exists orders (
  id           text primary key,
  user_phone   text not null references users(phone) on delete cascade,
  event_id     text not null,
  event_title  text not null,
  event_date   text not null,
  event_venue  text not null,
  seats        jsonb not null default '[]',
  total_amount integer not null,
  status       text not null default 'pending',
  ticket_code  text unique not null,
  created_at   timestamptz default now()
);

-- ── 5. Conversations（私訊對話）──────────────────────────────
create table if not exists conversations (
  id              text primary key,
  user_phone      text not null references users(phone) on delete cascade,
  contact_name    text not null,
  contact_avatar  text not null default '',
  created_at      timestamptz default now()
);

-- ── 6. Messages（私訊訊息）───────────────────────────────────
create table if not exists messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  text not null references conversations(id) on delete cascade,
  sender_id        text not null,
  body             text not null,
  read             boolean default false,
  created_at       timestamptz default now()
);

-- ── 7. Store Orders（商城兌換紀錄）───────────────────────────
create table if not exists store_orders (
  id          uuid primary key default uuid_generate_v4(),
  user_phone  text not null references users(phone) on delete cascade,
  item_id     text not null,
  name        text not null,
  image       text not null default '',
  points      integer not null,
  created_at  timestamptz default now()
);

-- ── 8. Point Transactions（點數交易紀錄）─────────────────────
create table if not exists point_transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_phone  text not null references users(phone) on delete cascade,
  type        text not null check (type in ('earn', 'redeem')),
  description text not null,
  points      integer not null,
  created_at  timestamptz default now()
);

-- ── 9. Forum Posts（論壇文章）────────────────────────────────
create table if not exists forum_posts (
  id             text primary key,
  title          text not null,
  content        text not null,
  author         text not null,
  author_avatar  text not null default '',
  category       text not null,
  tags           text[] default '{}',
  likes          integer default 0,
  views          integer default 0,
  pinned         boolean default false,
  hot            boolean default false,
  created_at     timestamptz default now()
);

-- ── 10. Forum Comments（論壇留言）────────────────────────────
create table if not exists forum_comments (
  id             uuid primary key default uuid_generate_v4(),
  post_id        text not null references forum_posts(id) on delete cascade,
  author         text not null,
  author_avatar  text not null default '',
  content        text not null,
  likes          integer default 0,
  created_at     timestamptz default now()
);

-- ── 11. Artist Forests（藝人森林）─────────────────────────────
create table if not exists artist_forests (
  id          text primary key,
  name        text not null,
  artist      text not null,
  trees       integer default 0,
  co2         integer default 0,
  fans        integer default 0,
  badge       text not null,
  zone        text not null,
  description text not null,
  globe_x     integer not null,
  globe_y     integer not null,
  color       text not null,
  grad_from   text not null,
  grad_to     text not null,
  image       text not null default '',
  rank        integer not null,
  created_at  timestamptz default now()
);

-- ── 12. Reward Items（點數商城商品）──────────────────────────
create table if not exists reward_items (
  id          text primary key,
  name        text not null,
  description text not null,
  points      integer not null,
  stock       integer not null,
  category    text not null,
  emoji       text not null default '',
  bg          text not null,
  image       text,
  popular     boolean default false,
  limited     boolean default false,
  is_new      boolean default false,
  created_at  timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ══════════════════════════════════════════════════════════════

alter table users             enable row level security;
alter table orders            enable row level security;
alter table conversations     enable row level security;
alter table messages          enable row level security;
alter table store_orders      enable row level security;
alter table point_transactions enable row level security;
alter table events            enable row level security;
alter table forum_posts       enable row level security;
alter table forum_comments    enable row level security;
alter table artist_forests    enable row level security;
alter table reward_items      enable row level security;

-- ── Public read policies（公開讀取）─────────────────────────
create policy "events_public_read"         on events          for select using (true);
create policy "forum_posts_public_read"    on forum_posts     for select using (true);
create policy "forum_comments_public_read" on forum_comments  for select using (true);
create policy "artist_forests_public_read" on artist_forests  for select using (true);
create policy "reward_items_public_read"   on reward_items    for select using (true);
create policy "seat_sections_public_read"  on seat_sections   for select using (true);

-- ── Users（自己的資料）──────────────────────────────────────
create policy "users_read_own"   on users for select using (true);
create policy "users_insert"     on users for insert with check (true);
create policy "users_update_own" on users for update using (true);

-- ── Orders（自己的訂單）─────────────────────────────────────
create policy "orders_read_own"   on orders for select using (true);
create policy "orders_insert"     on orders for insert with check (true);
create policy "orders_update"     on orders for update using (true);

-- ── Conversations & Messages ─────────────────────────────────
create policy "conv_read"   on conversations for select using (true);
create policy "conv_insert" on conversations for insert with check (true);
create policy "msg_read"    on messages for select using (true);
create policy "msg_insert"  on messages for insert with check (true);
create policy "msg_update"  on messages for update using (true);

-- ── Store & Points ───────────────────────────────────────────
create policy "store_orders_read"    on store_orders      for select using (true);
create policy "store_orders_insert"  on store_orders      for insert with check (true);
create policy "point_tx_read"        on point_transactions for select using (true);
create policy "point_tx_insert"      on point_transactions for insert with check (true);

-- ── Forum write ──────────────────────────────────────────────
create policy "forum_posts_insert"    on forum_posts    for insert with check (true);
create policy "forum_posts_update"    on forum_posts    for update using (true);
create policy "forum_comments_insert" on forum_comments for insert with check (true);
create policy "forum_comments_update" on forum_comments for update using (true);

-- ══════════════════════════════════════════════════════════════
-- Indexes（查詢效能）
-- ══════════════════════════════════════════════════════════════

create index if not exists idx_orders_user       on orders(user_phone);
create index if not exists idx_orders_status     on orders(status);
create index if not exists idx_messages_conv     on messages(conversation_id);
create index if not exists idx_messages_unread   on messages(conversation_id, read) where read = false;
create index if not exists idx_conv_user         on conversations(user_phone);
create index if not exists idx_store_user        on store_orders(user_phone);
create index if not exists idx_point_tx_user     on point_transactions(user_phone);
create index if not exists idx_forum_category    on forum_posts(category);
create index if not exists idx_forum_pinned      on forum_posts(pinned, hot);

-- ══════════════════════════════════════════════════════════════
-- Seed Data（初始資料）
-- ══════════════════════════════════════════════════════════════

-- Artist Forests
insert into artist_forests (id, name, artist, trees, co2, fans, badge, zone, description, globe_x, globe_y, color, grad_from, grad_to, image, rank) values
  ('jaychou',        '周杰倫森林',  '周杰倫',  203, 5180, 12480, '森林傳奇', '南投仁愛',                    '規模最大的藝人森林，南投仁愛的百年林地見證了傑倫音樂的傳奇歲月',                                                                               62, 52, '#d97706', 'from-amber-400', 'to-yellow-600',  'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&q=80', 1),
  ('jjlin',          '林俊杰森林',  '林俊杰',  178, 4530,  8940, '星光使者', '新加坡 Punggol 生態森林',      'Punggol 生態森林坐落於新加坡東北部濱海綠廊，JJ 以音樂為媒介跨越國界',                                                                        57, 60, '#0284c7', 'from-sky-400',   'to-blue-600',    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', 2),
  ('tzuyu',          '子瑜森林',    '周子瑜',  156, 3980,  4820, '守護天使', '馬來西亞 吉蘭州 ACACIA 森林',  'ACACIA 森林為一處退化森林，適合進行永續森林再造，結合當地住民共同守護這片珍貴的土地',                                                             34, 62, '#34d399', 'from-emerald-300','to-teal-500',    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', 3),
  ('huangzihongfan', '黃子弘凡森林','黃子弘凡', 134, 3421,  3650, '生態先鋒', '花蓮秀林',                    '花蓮秀林的深邃林地，隨著每場演出持續擴張，是台灣最具活力的音樂森林',                                                                               68, 40, '#059669', 'from-green-400',  'to-emerald-600', 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=400&q=80', 4),
  ('psy',            'PSY 森林',    'PSY',      89, 2234,  2310, '國際先鋒', '宜蘭大同',                    '橫跨韓台的國際森林，每棵樹都是一次跨文化的 ESG 行動',                                                                                           74, 30, '#7c3aed', 'from-violet-400', 'to-purple-600',  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&q=80', 5)
on conflict (id) do nothing;

-- ══════════════════════════════════════════════════════════════
-- Functions（輔助函數）
-- ══════════════════════════════════════════════════════════════

-- 更新 user updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on users
  for each row execute function update_updated_at();

-- 取得或建立 user（upsert by phone）
create or replace function upsert_user(p_phone text)
returns users as $$
declare
  result users;
begin
  insert into users (phone, verified, points)
  values (p_phone, false, 0)
  on conflict (phone) do nothing;
  select * into result from users where phone = p_phone;
  return result;
end;
$$ language plpgsql security definer;

-- 增減點數
create or replace function adjust_points(p_phone text, p_delta integer, p_type text, p_desc text)
returns integer as $$
declare
  new_pts integer;
begin
  update users
  set points = greatest(0, points + p_delta)
  where phone = p_phone
  returning points into new_pts;

  insert into point_transactions (user_phone, type, description, points)
  values (p_phone, p_type, p_desc, abs(p_delta));

  return new_pts;
end;
$$ language plpgsql security definer;
