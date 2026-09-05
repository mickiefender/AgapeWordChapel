create table if not exists public.sms_history (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  audience text not null check (audience in ('all', 'active', 'workers')),
  status text not null check (status in ('sent', 'failed')),
  recipient_count integer not null default 0 check (recipient_count >= 0),
  provider_response text,
  sent_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.sms_history enable row level security;

create index if not exists sms_history_created_at_idx on public.sms_history(created_at desc);
create index if not exists sms_history_status_idx on public.sms_history(status);

create policy "sms_history_admin_all"
  on public.sms_history for all
  using (public.is_admin())
  with check (public.is_admin());
