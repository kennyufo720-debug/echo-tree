-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Echo Tree — Seed Data                                       ║
-- ║  執行方式：Supabase Dashboard → SQL Editor → 貼上執行         ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── Events（演唱會活動）──────────────────────────────────────────
insert into events (id, title, artist, venue, city, date, time, image, category, price_from, price_to, total_seats, available_seats, status, tags, video_id, image_position) values
  ('9', '林俊傑 JJ LIN 明日座標 世界巡迴演唱會 台北站', '林俊傑 JJ Lin', '台北大巨蛋', '台北', '2026-09-05', '19:30', 'https://img.youtube.com/vi/Ra6tyMqBoss/maxresdefault.jpg', 'concert', 1800, 6800, 40000, 12000, 'on-sale', '{"熱門","快售完","星光"}', 'Ra6tyMqBoss', '50% 30%'),
  ('8', '回音樹 AI 歌手 爵士女伶 Ann — 夜之旋律', 'Ann（回音樹 AI 歌手）', '台北 Legacy Taipei', '台北', '2026-06-14', '20:00', '/ann-jazz-singer.jpg', 'concert', 1200, 3600, 800, 560, 'on-sale', '{"熱門","爵士","AI歌手"}', null, '50% 20%'),
  ('7', 'PSY 江南大叔 濕身系列 WORLD TOUR', 'PSY (朴載相)', '台北大巨蛋', '台北', '2026-07-18', '19:00', 'https://img.youtube.com/vi/QAc2-WVUbC8/maxresdefault.jpg', 'concert', 1800, 6800, 40000, 28000, 'on-sale', '{"熱門","K-POP","濕身"}', 'QAc2-WVUbC8', null),
  ('1', '2026 念念不忘必有回音 回音樹ESG音樂節', '回音樹', '大安森林公園露天音樂台', '台北', '2026-05-02', '14:00', '/image-1776910203160.jpg', 'festival', 980, 2800, 5000, 3200, 'on-sale', '{"ESG","戶外","熱門"}', 'iLQTVMjdzvY', null),
  ('2', 'BORN PINK WORLD TOUR', 'BLACKPINK', '高雄巨蛋', '高雄', '2025-09-20', '18:00', 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80', 'concert', 2200, 8800, 15000, 3200, 'on-sale', '{"快售完","K-POP"}', 'bo_efYLyPkc', null),
  ('3', '周子瑜 TZUYU SOLO CONCERT TOUR — 子瑜的森林', '周子瑜 TZUYU', '台北小巨蛋', '台北', '2026-08-15', '19:30', '/ziyu-forest.jpeg', 'concert', 2800, 9800, 15000, 8500, 'on-sale', '{"熱門","K-POP","ESG"}', null, '50% 25%'),
  ('4', '2026 Spring 回音森林音樂節', '多位藝人', '台中秋紅谷公園', '台中', '2026-04-20', '13:00', 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80', 'festival', 1200, 3600, 8000, 0, 'sold-out', '{"已售完","戶外"}', null, null),
  ('5', '黃子弘凡 2026 世界巡迴演唱會', '黃子弘凡', '台北大巨蛋', '台北', '2026-10-10', '19:30', 'https://img.youtube.com/vi/sHRqQ2sMlnc/maxresdefault.jpg', 'concert', 1800, 7800, 45000, 35000, 'on-sale', '{"預售","熱門"}', 'sHRqQ2sMlnc', null),
  ('6', '《浮生若夢》林俊傑經典作品音樂會', '林俊傑 JJ Lin', '國家音樂廳', '台北', '2026-12-25', '19:30', 'https://img.youtube.com/vi/Ra6tyMqBoss/hqdefault.jpg', 'concert', 3800, 12000, 2000, 2000, 'coming-soon', '{"即將開賣","古典"}', null, null)
on conflict (id) do update set
  available_seats = excluded.available_seats,
  status = excluded.status,
  tags = excluded.tags;

-- ── Reward Items（點數商城商品）──────────────────────────────────
insert into reward_items (id, name, description, points, stock, category, emoji, bg, image, popular, limited, is_new) values
  ('m1',  '限定帆布袋',           '回音樹官方限定帆布袋，採用環保棉布製作',          490,  50,  'bag',       '👜', 'from-orange-100 to-amber-50',   'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', true,  false, false),
  ('m2',  '刺繡徽章組',           '3款主題刺繡徽章，手工製作',                       290,  120, 'accessory', '📛', 'from-purple-100 to-violet-50',  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', false, false, true),
  ('m3',  '演唱會手環',           '限量螢光手環，現場配戴專用',                       199,  80,  'accessory', '💫', 'from-pink-100 to-rose-50',      'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80', false, true,  false),
  ('m10', 'AIWA 愛華 藍芽耳機',   '聯名款高音質藍芽耳機，超長續航',                  2980, 30,  'tech',      '🎧', 'from-indigo-100 to-blue-50',    '/aiwa-earphone.jpeg',                                                   true,  true,  false),
  ('m5',  '限定 Tee 上衣',        '回音樹官方限定Tee，有機棉材質',                   1480, 30,  'clothing',  '👕', 'from-pink-100 to-fuchsia-50',   'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', false, true,  false),
  ('m6',  '音樂節馬克杯',         '限定設計馬克杯，陶瓷材質',                         590,  60,  'lifestyle', '☕', 'from-amber-100 to-orange-50',   'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80', true,  false, false),
  ('m7',  '折疊雨傘',             '輕量折疊雨傘，防風設計',                           980,  40,  'lifestyle', '☂️', 'from-blue-100 to-sky-50',       'https://images.unsplash.com/photo-1558618047-3c5c3a4ed6c6?w=400&q=80', false, false, false),
  ('m8',  'PSY X ECHO 滅火器',    'PSY聯名款森林滅火器，限量珍藏',                   2480, 50,  'collab',    '🧯', 'from-sky-100 to-cyan-50',       '/psy-x-echo-extinguisher.jpg',                                          true,  true,  false),
  ('m9',  'echo tree 低碳T雪',    '低碳限量白色T恤，回收材質製作',                    890,  60,  'clothing',  '🌿', 'from-green-100 to-emerald-50',  '/echo-tree-tee-white.jpg',                                              false, true,  true)
on conflict (id) do update set stock = excluded.stock, points = excluded.points;

select '✅ Seed 完成！events: ' || count(*)::text || ' 筆' from events
union all
select '✅ forum_posts: ' || count(*)::text || ' 筆' from forum_posts
union all
select '✅ reward_items: ' || count(*)::text || ' 筆' from reward_items
union all
select '✅ artist_forests: ' || count(*)::text || ' 筆' from artist_forests;
