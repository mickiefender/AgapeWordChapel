-- Public contact and homepage pages need to show admin-managed service times.
create policy "services_public_read"
  on public.services for select
  using (true);
