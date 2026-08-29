-- DripCheck database schema.
-- Run this in the Supabase SQL editor once a project exists. Safe to re-run:
-- every object uses "if not exists" / "or replace".
--
-- fit_analysis is intentionally NOT a separate table: it lives as
-- fit_checks.analysis_json to avoid a two-table write inside the single
-- analyze-fit API route. daily_leaderboard is a VIEW (see bottom of file),
-- not a table, so it can never drift from leaderboard_entries.

create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ── fit_checks ──────────────────────────────────────────────────────────
create table if not exists fit_checks (
  id uuid primary key default gen_random_uuid(),
  participant_name text not null check (char_length(participant_name) between 1 and 40),
  user_id uuid references profiles (id) on delete set null,
  image_url text not null,
  check_type text not null check (check_type in ('full', 'partial')),
  score numeric(3, 1) not null check (score >= 1.0 and score <= 10.0),
  style text,
  description text,
  analysis_json jsonb not null,
  is_public boolean not null default true,
  source text not null default 'live' check (source in ('live', 'upload')),
  created_at timestamptz not null default now()
);

create index if not exists idx_fit_checks_created_at on fit_checks (created_at desc);
create index if not exists idx_fit_checks_user_id on fit_checks (user_id);
create index if not exists idx_fit_checks_public on fit_checks (is_public) where is_public = true;

-- ── leaderboard_entries ─────────────────────────────────────────────────
create table if not exists leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  fit_check_id uuid not null references fit_checks (id) on delete cascade,
  participant_name text not null,
  score numeric(3, 1) not null check (score >= 1.0 and score <= 10.0),
  created_at timestamptz not null default now()
);

create index if not exists idx_leaderboard_entries_created_at on leaderboard_entries (created_at desc);
create index if not exists idx_leaderboard_entries_score on leaderboard_entries (score desc);

-- Today's leaderboard, derived — never write to this directly.
create or replace view daily_leaderboard_view as
select
  le.*,
  fc.style,
  rank() over (order by le.score desc, le.created_at asc) as rank
from leaderboard_entries le
join fit_checks fc on fc.id = le.fit_check_id
where le.created_at::date = (now() at time zone 'utc')::date;

-- ── outfits (Discover feed) ─────────────────────────────────────────────
create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  fit_check_id uuid references fit_checks (id) on delete set null,
  name text not null,
  image_url text not null,
  score numeric(3, 1),
  style text,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_outfits_created_at on outfits (created_at desc);
create index if not exists idx_outfits_score on outfits (score desc);

-- ── likes ───────────────────────────────────────────────────────────────
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (outfit_id, user_id)
);

create index if not exists idx_likes_outfit_id on likes (outfit_id);

-- ── saved_outfits ───────────────────────────────────────────────────────
create table if not exists saved_outfits (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (outfit_id, user_id)
);

create index if not exists idx_saved_outfits_user_id on saved_outfits (user_id);

-- ── future/schema-only stubs ────────────────────────────────────────────
-- No UI/API against these yet. Kept minimal on purpose.
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid references outfits (id) on delete cascade,
  user_id uuid references profiles (id) on delete cascade,
  body text,
  created_at timestamptz not null default now()
);

create table if not exists follows (
  follower_id uuid references profiles (id) on delete cascade,
  following_id uuid references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists challenge_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges (id) on delete cascade,
  fit_check_id uuid references fit_checks (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  icon_url text
);

create table if not exists user_badges (
  user_id uuid references profiles (id) on delete cascade,
  badge_id uuid references badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);
