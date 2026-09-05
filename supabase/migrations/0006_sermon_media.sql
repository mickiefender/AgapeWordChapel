alter table public.sermons add column if not exists image_url text;
alter table public.sermons add column if not exists facebook_url text;

insert into storage.buckets (id, name, public)
values ('sermon-media', 'sermon-media', true)
on conflict (id) do update set public = true;

create policy "sermon_media_public_read" on storage.objects for select
  using (bucket_id = 'sermon-media');
create policy "sermon_media_admin_insert" on storage.objects for insert
  with check (bucket_id = 'sermon-media' and public.is_admin());
create policy "sermon_media_admin_update" on storage.objects for update
  using (bucket_id = 'sermon-media' and public.is_admin())
  with check (bucket_id = 'sermon-media' and public.is_admin());
create policy "sermon_media_admin_delete" on storage.objects for delete
  using (bucket_id = 'sermon-media' and public.is_admin());
