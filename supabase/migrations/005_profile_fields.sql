-- DripCheck migration 005 — editable profile fields (username + avatar).
-- Safe to run multiple times. Run AFTER schema.sql / policies.sql.

alter table profiles add column if not exists username text;

-- Case-insensitive uniqueness, ignoring rows that haven't set one yet.
create unique index if not exists idx_profiles_username
  on profiles (lower(username))
  where username is not null;

-- Ensure the self-update policy exists (also created in policies.sql).
drop policy if exists "users update their own profile" on profiles;
create policy "users update their own profile" on profiles
  for update using (auth.uid() = id);

-- Avatar images bucket. Public read; uploads happen server-side via the
-- service-role client, same pattern as fit-checks / closet.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars are publicly readable" on storage.objects;
create policy "avatars are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');
