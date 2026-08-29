-- Storage bucket for captured/uploaded fit-check images. Safe to re-run.
-- Public read (Discover/leaderboard need to display them); no client insert
-- policy — uploads happen server-side in the analyze-fit API route via the
-- service-role client, which bypasses storage RLS the same way it bypasses
-- table RLS. File type/size are validated in lib/validation.ts before the
-- upload is attempted.

insert into storage.buckets (id, name, public)
values ('fit-checks', 'fit-checks', true)
on conflict (id) do update set public = true;

drop policy if exists "fit-checks images are publicly readable" on storage.objects;
create policy "fit-checks images are publicly readable" on storage.objects
  for select using (bucket_id = 'fit-checks');
