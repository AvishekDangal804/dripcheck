-- DripCheck migration 003 — My Closet.
-- Safe to run multiple times. Run AFTER schema.sql / policies.sql.

create table if not exists closet_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  category text not null check (category in
    ('tshirt', 'shirt', 'pants', 'jeans', 'shorts', 'shoes', 'jacket', 'outerwear', 'accessory')),
  name text not null,
  image_url text not null,
  color text,
  style text,
  pattern text,
  created_at timestamptz not null default now()
);

create index if not exists idx_closet_items_user on closet_items (user_id, created_at desc);

alter table closet_items enable row level security;

-- A user fully owns their closet: read / add / edit / delete their own rows.
drop policy if exists "users read their own closet" on closet_items;
create policy "users read their own closet" on closet_items
  for select using (auth.uid() = user_id);

drop policy if exists "users add to their own closet" on closet_items;
create policy "users add to their own closet" on closet_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "users edit their own closet" on closet_items;
create policy "users edit their own closet" on closet_items
  for update using (auth.uid() = user_id);

drop policy if exists "users delete from their own closet" on closet_items;
create policy "users delete from their own closet" on closet_items
  for delete using (auth.uid() = user_id);

-- Storage bucket for closet item photos. Public read so item images render
-- on the closet / create-a-fit pages; writes go through the server.
insert into storage.buckets (id, name, public)
values ('closet', 'closet', true)
on conflict (id) do update set public = true;

drop policy if exists "closet images are publicly readable" on storage.objects;
create policy "closet images are publicly readable" on storage.objects
  for select using (bucket_id = 'closet');
