-- DripCheck migration 004 — "Create a Fit From My Closet" saved outfits.
-- Safe to run multiple times. Run AFTER migration 003.

create table if not exists generated_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  vibe text,
  occasion text,
  palette jsonb not null default '[]'::jsonb,
  compatibility numeric(3, 1),
  rationale text,
  created_at timestamptz not null default now()
);

create index if not exists idx_generated_outfits_user on generated_outfits (user_id, created_at desc);

create table if not exists generated_outfit_items (
  generated_outfit_id uuid not null references generated_outfits (id) on delete cascade,
  closet_item_id uuid not null references closet_items (id) on delete cascade,
  slot text not null,
  primary key (generated_outfit_id, closet_item_id)
);

alter table generated_outfits enable row level security;
alter table generated_outfit_items enable row level security;

drop policy if exists "users read their own generated outfits" on generated_outfits;
create policy "users read their own generated outfits" on generated_outfits
  for select using (auth.uid() = user_id);

drop policy if exists "users save their own generated outfits" on generated_outfits;
create policy "users save their own generated outfits" on generated_outfits
  for insert with check (auth.uid() = user_id);

drop policy if exists "users delete their own generated outfits" on generated_outfits;
create policy "users delete their own generated outfits" on generated_outfits
  for delete using (auth.uid() = user_id);

drop policy if exists "users read their own generated outfit items" on generated_outfit_items;
create policy "users read their own generated outfit items" on generated_outfit_items
  for select using (
    exists (
      select 1 from generated_outfits go
      where go.id = generated_outfit_id and go.user_id = auth.uid()
    )
  );

drop policy if exists "users add their own generated outfit items" on generated_outfit_items;
create policy "users add their own generated outfit items" on generated_outfit_items
  for insert with check (
    exists (
      select 1 from generated_outfits go
      where go.id = generated_outfit_id and go.user_id = auth.uid()
    )
  );
