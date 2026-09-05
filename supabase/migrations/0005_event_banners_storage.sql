-- Public event banner storage. Uploads remain restricted to admins.
insert into storage.buckets (id, name, public)
values ('event-banners', 'event-banners', true)
on conflict (id) do update set public = true;

create policy "event_banners_public_read"
  on storage.objects for select
  using (bucket_id = 'event-banners');

create policy "event_banners_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'event-banners' and public.is_admin());

create policy "event_banners_admin_update"
  on storage.objects for update
  using (bucket_id = 'event-banners' and public.is_admin())
  with check (bucket_id = 'event-banners' and public.is_admin());

create policy "event_banners_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'event-banners' and public.is_admin());
