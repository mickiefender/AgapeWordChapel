drop policy if exists "audit_logs_insert" on public.audit_logs;

create policy "audit_logs_insert_own"
  on public.audit_logs for insert
  with check (user_id = auth.uid() or public.is_admin());
