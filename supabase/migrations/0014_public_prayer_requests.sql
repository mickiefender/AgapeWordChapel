-- Allow anonymous visitors to submit prayer requests from the public homepage.
create policy "prayer_requests_public_insert"
  on public.prayer_requests for insert
  with check (
    member_id is null
    and status = 'new'
    and privacy = 'private'
  );
