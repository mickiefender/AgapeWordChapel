alter table public.sermons
  add column if not exists youtube_url text,
  add column if not exists status text not null default 'unpublished';

alter table public.sermons
  drop constraint if exists sermons_status_check;

alter table public.sermons
  add constraint sermons_status_check check (status in ('published', 'unpublished'));
