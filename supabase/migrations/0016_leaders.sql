create table if not exists public.leaders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  bio text,
  image_url text,
  email text,
  phone text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leaders enable row level security;

create trigger set_leaders_updated_at
  before update on public.leaders
  for each row execute function public.set_updated_at();

create index if not exists leaders_public_order_idx
  on public.leaders(is_active, sort_order, name);

create policy "leaders_admin_all"
  on public.leaders for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "leaders_public_read"
  on public.leaders for select
  using (is_active = true);
