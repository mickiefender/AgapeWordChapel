-- ============================================================================
-- Agape Word Chapel International — Ministry Join Requests
-- Stores public submissions from the "Connect with us" form on a ministry
-- page. Anyone can insert a request; only admins can read/update/delete.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Ministry join requests table
-- ----------------------------------------------------------------------------
create table if not exists public.ministry_join_requests (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  email text,
  phone text,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ministry_join_requests enable row level security;

create index if not exists ministry_join_requests_department_idx
  on public.ministry_join_requests(department_id);
create index if not exists ministry_join_requests_status_idx
  on public.ministry_join_requests(status);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ministry_join_requests_updated_at on public.ministry_join_requests;
create trigger set_ministry_join_requests_updated_at
  before update on public.ministry_join_requests
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Row Level Security policies
-- ----------------------------------------------------------------------------

-- Anyone (including anonymous visitors) can submit a join request.
create policy "ministry_join_requests_public_insert"
  on public.ministry_join_requests for insert
  with check (true);

-- Only admins can read, update, and delete requests.
create policy "ministry_join_requests_admin_select"
  on public.ministry_join_requests for select
  using (public.is_admin());

create policy "ministry_join_requests_admin_update"
  on public.ministry_join_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "ministry_join_requests_admin_delete"
  on public.ministry_join_requests for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Done. Public visitors can now submit a "Connect with us" join request; the
-- church admin reviews them from /dashboard/join-requests.
-- ----------------------------------------------------------------------------
