-- ============================================================================
-- Public read policies for the church website
-- ----------------------------------------------------------------------------
-- The homepage (app/page.tsx) fetches the next service, latest sermons,
-- upcoming events and ministries using the anonymous (anon) Supabase client.
-- The base RLS policies in 0001_initial_schema.sql gate those tables behind
-- `auth.uid() is not null`, which returns ZERO rows for logged-out visitors.
--
-- These policies allow anonymous SELECT on the public-facing tables so the
-- homepage sections render for visitors who are not signed in.
--
-- NOTE: Authenticated users are unaffected — policies are OR-combined per role,
-- so the existing admin/auth policies continue to work alongside these.
-- ============================================================================

create policy "services_public_read"
  on public.services
  for select
  to anon
  using (true);

create policy "sermons_public_read"
  on public.sermons
  for select
  to anon
  using (true);

create policy "events_public_read"
  on public.events
  for select
  to anon
  using (true);

create policy "departments_public_read"
  on public.departments
  for select
  to anon
  using (true);
