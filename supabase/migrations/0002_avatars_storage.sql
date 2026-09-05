-- ============================================================================
-- Agape Word Chapel International — Member Profile Photo Storage
-- Creates the public 'avatars' bucket and secure storage policies.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
--
-- The bucket is public so profile photos are readable by anyone (the app
-- renders them via public URLs). Uploads are restricted to admins, matching
-- the "admin uploads a member's profile picture" requirement. The server
-- action also creates this bucket on-the-fly via the service role; this
-- migration sets it up declaratively with the proper policies.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Ensure the members table has an avatar_url column (idempotent — already
--    present from migration 0001, but safe to keep for re-runs)
-- ----------------------------------------------------------------------------
alter table public.members
  add column if not exists avatar_url text;

-- ----------------------------------------------------------------------------
-- 2. Create the public 'avatars' storage bucket
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- ----------------------------------------------------------------------------
-- 3. Storage policies for storage.objects on the 'avatars' bucket
-- ----------------------------------------------------------------------------

-- Anyone (authenticated or anonymous) can view images in the bucket.
-- Required for the public URL to work via the storage API.
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Only admins can upload new profile photos.
create policy "avatars_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and public.is_admin()
  );

-- Only admins can overwrite existing profile photos.
create policy "avatars_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and public.is_admin()
  )
  with check (
    bucket_id = 'avatars'
    and public.is_admin()
  );

-- Only admins can delete profile photos.
create policy "avatars_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- Done. The 'avatars' bucket is now publicly readable and admin-writable, and
-- the members.avatar_url column stores the public URL returned by the app.
-- ----------------------------------------------------------------------------
