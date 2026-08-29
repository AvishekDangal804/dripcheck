-- Row Level Security policies. Safe to run multiple times — every policy is
-- dropped before it is (re)created, and the signup trigger is guarded.
--
-- Security model: score, analysis_json, check_type, style, and description
-- on fit_checks/leaderboard_entries are NEVER accepted from the client.
-- The only writer of those tables is app/api/analyze-fit/route.ts, running
-- server-side with the Supabase service-role key (lib/supabase/admin.ts),
-- which bypasses RLS entirely. That is why fit_checks and leaderboard_entries
-- have NO insert/update policy for the anon/authenticated roles below — it's
-- intentional, not an oversight. A client can only ever read those tables.

-- ── profiles ────────────────────────────────────────────────────────────
alter table profiles enable row level security;
drop policy if exists "profiles are publicly readable" on profiles;
create policy "profiles are publicly readable" on profiles
  for select using (true);
drop policy if exists "users update their own profile" on profiles;
create policy "users update their own profile" on profiles
  for update using (auth.uid() = id);

-- ── fit_checks ──────────────────────────────────────────────────────────
alter table fit_checks enable row level security;
drop policy if exists "public fit checks are readable" on fit_checks;
create policy "public fit checks are readable" on fit_checks
  for select using (is_public = true or user_id = auth.uid());
-- No insert/update/delete policy: all writes go through the service-role
-- client in the analyze-fit API route.

-- ── leaderboard_entries ─────────────────────────────────────────────────
alter table leaderboard_entries enable row level security;
drop policy if exists "leaderboard is publicly readable" on leaderboard_entries;
create policy "leaderboard is publicly readable" on leaderboard_entries
  for select using (true);
-- No insert policy, same reasoning as fit_checks above.

-- ── outfits (Discover feed) ─────────────────────────────────────────────
alter table outfits enable row level security;
drop policy if exists "outfits are publicly readable" on outfits;
create policy "outfits are publicly readable" on outfits
  for select using (true);
-- No client insert policy in the MVP: outfits are seeded/promoted
-- server-side (from fit_checks or supabase/seed.sql), not user-authored.

-- ── likes ───────────────────────────────────────────────────────────────
alter table likes enable row level security;
drop policy if exists "likes are publicly readable" on likes;
create policy "likes are publicly readable" on likes
  for select using (true);
drop policy if exists "users manage their own likes" on likes;
create policy "users manage their own likes" on likes
  for insert with check (auth.uid() = user_id);
drop policy if exists "users remove their own likes" on likes;
create policy "users remove their own likes" on likes
  for delete using (auth.uid() = user_id);

-- ── saved_outfits ───────────────────────────────────────────────────────
alter table saved_outfits enable row level security;
drop policy if exists "users read their own saves" on saved_outfits;
create policy "users read their own saves" on saved_outfits
  for select using (auth.uid() = user_id);
drop policy if exists "users manage their own saves" on saved_outfits;
create policy "users manage their own saves" on saved_outfits
  for insert with check (auth.uid() = user_id);
drop policy if exists "users remove their own saves" on saved_outfits;
create policy "users remove their own saves" on saved_outfits
  for delete using (auth.uid() = user_id);

-- ── schema-only stub tables ─────────────────────────────────────────────
-- RLS enabled, no policies yet (effectively inaccessible to
-- anon/authenticated until this feature is built).
alter table comments enable row level security;
alter table follows enable row level security;
alter table challenges enable row level security;
alter table challenge_entries enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;

-- ── auto-create a profile row whenever a new auth user signs up ─────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
