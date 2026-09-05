create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  sender_email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact_messages_public_insert"
  on public.contact_messages for insert
  with check (true);

create policy "contact_messages_admin_read"
  on public.contact_messages for select
  using (public.is_admin());

create policy "contact_messages_admin_update"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

create index contact_messages_created_at_idx on public.contact_messages(created_at desc);
