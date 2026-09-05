-- Stores the public banner image used for event listings and detail pages.
alter table public.events
  add column if not exists image_url text;
