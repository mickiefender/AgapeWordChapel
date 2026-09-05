-- ============================================================================
-- Agape Word Chapel International — Ministry/Dedicated Department Page Media
-- Adds public-facing content to each department (which the site surfaces as a
-- "ministry" page) and creates a bucket for cover/gallery images.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add public-facing content columns to departments
-- ----------------------------------------------------------------------------
alter table public.departments
  add column if not exists image_url text,
  add column if not exists gallery text[] not null default '{}',
  add column if not exists video_url text,
  add column if not exists meeting_time text,
  add column if not exists meeting_location text;

-- ----------------------------------------------------------------------------
-- 2. Create the public 'department-media' storage bucket
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('department-media', 'department-media', true)
on conflict (id) do update set public = true;

-- ----------------------------------------------------------------------------
-- 3. Storage policies on storage.objects for the 'department-media' bucket
-- ----------------------------------------------------------------------------

-- Anyone can view ministry media (rendered via public URLs on public pages).
create policy "department_media_public_read"
  on storage.objects for select
  using (bucket_id = 'department-media');

-- Only admins can upload media.
create policy "department_media_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'department-media'
    and public.is_admin()
  );

-- Only admins can overwrite media.
create policy "department_media_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'department-media'
    and public.is_admin()
  )
  with check (
    bucket_id = 'department-media'
    and public.is_admin()
  );

-- Only admins can delete media.
create policy "department_media_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'department-media'
    and public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- Done. Each department now has an image_url (cover), a gallery of images,
-- an optional video_url, plus meeting time/location for its public page.
-- ----------------------------------------------------------------------------
