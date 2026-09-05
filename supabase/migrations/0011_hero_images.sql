create table if not exists public.hero_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text not null unique,
  title text,
  duration_seconds integer not null default 5 check (duration_seconds between 1 and 60),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hero_images_active_order_idx
  on public.hero_images (is_active, sort_order, created_at);

drop trigger if exists set_hero_images_updated_at on public.hero_images;
create trigger set_hero_images_updated_at
  before update on public.hero_images
  for each row execute function public.set_updated_at();

alter table public.hero_images enable row level security;

drop policy if exists "hero_images_public_read_active" on public.hero_images;
create policy "hero_images_public_read_active"
  on public.hero_images for select
  using (is_active = true or public.is_admin());

drop policy if exists "hero_images_admin_insert" on public.hero_images;
create policy "hero_images_admin_insert"
  on public.hero_images for insert
  with check (public.is_admin());

drop policy if exists "hero_images_admin_update" on public.hero_images;
create policy "hero_images_admin_update"
  on public.hero_images for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "hero_images_admin_delete" on public.hero_images;
create policy "hero_images_admin_delete"
  on public.hero_images for delete
  using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('hero-images', 'hero-images', true)
on conflict (id) do update set public = true;

drop policy if exists "hero_images_storage_public_read" on storage.objects;
create policy "hero_images_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'hero-images');

drop policy if exists "hero_images_storage_admin_insert" on storage.objects;
create policy "hero_images_storage_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'hero-images' and public.is_admin());

drop policy if exists "hero_images_storage_admin_update" on storage.objects;
create policy "hero_images_storage_admin_update"
  on storage.objects for update
  using (bucket_id = 'hero-images' and public.is_admin())
  with check (bucket_id = 'hero-images' and public.is_admin());

drop policy if exists "hero_images_storage_admin_delete" on storage.objects;
create policy "hero_images_storage_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'hero-images' and public.is_admin());
