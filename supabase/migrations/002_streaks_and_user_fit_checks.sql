-- DripCheck migration 002 — fit-check streaks + per-category score columns.
-- Safe to run multiple times. Run AFTER schema.sql / policies.sql.

-- ── per-category score columns on fit_checks ────────────────────────────
-- analysis_json already holds the full breakdown; these denormalised
-- columns make leaderboard / profile queries cheap and are what Feature 11
-- of the brief asks to store explicitly. All nullable — a category that
-- wasn't visible stays NULL, never 0.
alter table fit_checks add column if not exists top_score numeric(3, 1);
alter table fit_checks add column if not exists bottom_score numeric(3, 1);
alter table fit_checks add column if not exists shoes_score numeric(3, 1);
alter table fit_checks add column if not exists accessories_score numeric(3, 1);
alter table fit_checks add column if not exists color_score numeric(3, 1);

-- ── streaks ────────────────────────────────────────────────────────────
-- One row per user. Written only by the server (service-role) from the
-- analyze-fit route; the client can read its own row.
create table if not exists streaks (
  user_id uuid primary key references profiles (id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_check_date date,
  updated_at timestamptz not null default now()
);

alter table streaks enable row level security;
drop policy if exists "users read their own streak" on streaks;
create policy "users read their own streak" on streaks
  for select using (auth.uid() = user_id);
-- No insert/update policy: streaks are server-controlled, same model as
-- fit_checks / leaderboard_entries.
