insert into public.menus (name, duration_minutes, price, is_active)
values
  ('まつげパーマ', 60, 6600, true),
  ('美眉スタイリング', 45, 5500, true),
  ('ワンカラーネイル', 90, 7700, true)
on conflict do nothing;

insert into public.business_settings (
  salon_name,
  address,
  business_hours,
  regular_holiday,
  map_url,
  notes
)
values (
  'Lumi Private Salon',
  '東京都渋谷区神宮前 1-2-3 Lumi Building 2F',
  '{"open":"10:00","close":"19:00","slotIntervalMinutes":30}'::jsonb,
  '[2]'::jsonb,
  'https://maps.google.com/?q=Tokyo',
  '施術中はお電話に出られないため、LINEからのご連絡をお願いいたします。初回の方はカウンセリングのため5分前のご来店をおすすめしています。'
)
on conflict do nothing;

insert into public.blocked_slots (blocked_date, blocked_time, is_all_day, reason)
values
  (current_date + interval '2 day', '13:00', false, '仕入れ対応'),
  (current_date + interval '5 day', null, true, '休業日')
on conflict do nothing;
