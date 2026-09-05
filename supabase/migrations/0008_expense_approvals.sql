-- Expense workflow fields. Existing approved expenses remain approved.
alter table public.expenses
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  add column if not exists requested_by uuid references public.profiles(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists rejection_reason text;

update public.expenses
set approval_status = 'approved',
    approved_at = coalesce(approved_at, created_at)
where approved_by is not null
  and approval_status = 'pending';

create index if not exists expenses_approval_status_idx on public.expenses(approval_status);
