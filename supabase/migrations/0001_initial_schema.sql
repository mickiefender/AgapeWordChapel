-- ============================================================================
-- Agape Word Chapel International — Church Management System
-- Initial Schema + Row Level Security
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- ============================================================================

-- Required extensions
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Helper: auto-update updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

set check_function_bodies = false;

-- ----------------------------------------------------------------------------
-- Auth / Role helper functions (SECURITY DEFINER so they bypass RLS on profiles)
-- ----------------------------------------------------------------------------
create or replace function public.user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'super_admin'
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role in ('super_admin', 'pastor', 'church_admin')
  )
$$;

create or replace function public.is_finance_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role in ('super_admin', 'pastor', 'church_admin', 'finance_officer')
  )
$$;

create or replace function public.is_pastor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role in ('super_admin', 'pastor')
  )
$$;

create or replace function public.is_leader()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role in ('super_admin', 'pastor', 'church_admin', 'department_leader', 'cell_leader')
  )
$$;

-- One-time setup helper: true if any super admin already exists
create or replace function public.is_setup_complete()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where role = 'super_admin'
  )
$$;

set check_function_bodies = true;

-- ----------------------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade not null,
  role text not null default 'member'
    check (role in ('super_admin', 'pastor', 'church_admin', 'finance_officer',
                   'department_leader', 'cell_leader', 'worker', 'member')),
  first_name text not null,
  last_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = user_id or public.is_admin());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles_admin_update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Auto-create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- FAMILIES
-- ----------------------------------------------------------------------------
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  head_member_id uuid,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.families enable row level security;

create trigger set_families_updated_at
  before update on public.families
  for each row execute function public.set_updated_at();

create policy "families_admin_all"
  on public.families for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "families_member_read"
  on public.families for select
  using (auth.uid() is not null);

create index families_head_member_idx on public.families(head_member_id);

-- ----------------------------------------------------------------------------
-- MEMBERS
-- ----------------------------------------------------------------------------
create table public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  family_id uuid references public.families(id) on delete set null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  phone text,
  email text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  marital_status text
    check (marital_status in ('single', 'married', 'engaged', 'widowed', 'divorced', 'separated')),
  occupation text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  membership_date date,
  membership_status text not null default 'visitor'
    check (membership_status in ('visitor', 'new_convert', 'new_member', 'active_member',
                                'worker', 'leader', 'inactive')),
  baptism_status text,
  branch_location text,
  notes text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.members enable row level security;

create trigger set_members_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

create index members_profile_id_idx on public.members(profile_id);
create index members_family_id_idx on public.members(family_id);
create index members_user_id_idx on public.members(user_id);
create index members_status_idx on public.members(membership_status);
create index members_last_name_idx on public.members(last_name);

create policy "members_admin_all"
  on public.members for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "members_read_self"
  on public.members for select
  using (auth.uid() = user_id or public.is_leader());

-- ----------------------------------------------------------------------------
-- FAMILY MEMBERS (join)
-- ----------------------------------------------------------------------------
create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  relationship text,
  created_at timestamptz not null default now(),
  unique (family_id, member_id)
);

alter table public.family_members enable row level security;

create policy "family_members_admin_all"
  on public.family_members for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "family_members_member_read"
  on public.family_members for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- VISITORS
-- ----------------------------------------------------------------------------
create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  visit_date date not null default current_date,
  service_attended text,
  invited_by text,
  location text,
  notes text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'follow_up', 'connected', 'joined', 'not_interested')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.visitors enable row level security;

create trigger set_visitors_updated_at
  before update on public.visitors
  for each row execute function public.set_updated_at();

create index visitors_status_idx on public.visitors(status);
create index visitors_assigned_to_idx on public.visitors(assigned_to);

create policy "visitors_admin_all"
  on public.visitors for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "visitors_read_any"
  on public.visitors for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- MEMBER JOURNEYS
-- ----------------------------------------------------------------------------
create table public.member_journeys (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade not null,
  stage text not null
    check (stage in ('visitor', 'follow_up', 'new_convert', 'membership_class', 'baptism',
                     'cell_group', 'department', 'worker', 'leader')),
  notes text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.member_journeys enable row level security;

create index member_journeys_member_idx on public.member_journeys(member_id);
create index member_journeys_stage_idx on public.member_journeys(stage);

create policy "member_journeys_admin_all"
  on public.member_journeys for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "member_journeys_read_leader"
  on public.member_journeys for select
  using (public.is_leader());

-- ----------------------------------------------------------------------------
-- FOLLOW-UPS
-- ----------------------------------------------------------------------------
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  visitor_id uuid references public.visitors(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null not null,
  task text not null,
  due_date date,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.follow_ups enable row level security;

create trigger set_follow_ups_updated_at
  before update on public.follow_ups
  for each row execute function public.set_updated_at();

create index follow_ups_assigned_to_idx on public.follow_ups(assigned_to);
create index follow_ups_status_idx on public.follow_ups(status);

create policy "follow_ups_admin_all"
  on public.follow_ups for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "follow_ups_assignee_read"
  on public.follow_ups for select
  using (assigned_to = auth.uid() or public.is_leader());

-- ----------------------------------------------------------------------------
-- DEPARTMENTS
-- ----------------------------------------------------------------------------
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  leader_id uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.departments enable row level security;

create trigger set_departments_updated_at
  before update on public.departments
  for each row execute function public.set_updated_at();

create policy "departments_admin_all"
  on public.departments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "departments_read_all"
  on public.departments for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- MINISTRIES
-- ----------------------------------------------------------------------------
create table public.ministries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  leader_id uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ministries enable row level security;

create trigger set_ministries_updated_at
  before update on public.ministries
  for each row execute function public.set_updated_at();

create policy "ministries_admin_all"
  on public.ministries for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "ministries_read_all"
  on public.ministries for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- DEPARTMENT MEMBERS
-- ----------------------------------------------------------------------------
create table public.department_members (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  role text,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (department_id, member_id)
);

alter table public.department_members enable row level security;

create index department_members_department_idx on public.department_members(department_id);
create index department_members_member_idx on public.department_members(member_id);

create policy "department_members_admin_all"
  on public.department_members for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "department_members_read_all"
  on public.department_members for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- CELL GROUPS
-- ----------------------------------------------------------------------------
create table public.cell_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  leader_id uuid references public.members(id) on delete set null,
  assistant_leader_id uuid references public.members(id) on delete set null,
  meeting_location text,
  meeting_day text,
  meeting_time text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cell_groups enable row level security;

create trigger set_cell_groups_updated_at
  before update on public.cell_groups
  for each row execute function public.set_updated_at();

create policy "cell_groups_admin_all"
  on public.cell_groups for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "cell_groups_read_all"
  on public.cell_groups for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- CELL GROUP MEMBERS
-- ----------------------------------------------------------------------------
create table public.cell_group_members (
  id uuid primary key default gen_random_uuid(),
  cell_group_id uuid references public.cell_groups(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  role text,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (cell_group_id, member_id)
);

alter table public.cell_group_members enable row level security;

create index cell_group_members_group_idx on public.cell_group_members(cell_group_id);
create index cell_group_members_member_idx on public.cell_group_members(member_id);

create policy "cell_group_members_admin_all"
  on public.cell_group_members for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "cell_group_members_read_all"
  on public.cell_group_members for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- CELL GROUP REPORTS
-- ----------------------------------------------------------------------------
create table public.cell_group_reports (
  id uuid primary key default gen_random_uuid(),
  cell_group_id uuid references public.cell_groups(id) on delete cascade not null,
  week_starting date not null,
  total_members integer not null default 0,
  present integer not null default 0,
  visitors integer not null default 0,
  new_converts integer not null default 0,
  notes text,
  submitted_by uuid references public.profiles(id) on delete set null not null,
  created_at timestamptz not null default now()
);

alter table public.cell_group_reports enable row level security;

create index cell_group_reports_group_idx on public.cell_group_reports(cell_group_id);

create policy "cell_group_reports_admin_all"
  on public.cell_group_reports for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "cell_group_reports_leader_read"
  on public.cell_group_reports for select
  using (public.is_leader());

-- ----------------------------------------------------------------------------
-- SERVICES
-- ----------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  start_time time,
  end_time time,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create index services_date_idx on public.services(date);

create policy "services_admin_all"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "services_read_all"
  on public.services for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- SERVICE ITEMS
-- ----------------------------------------------------------------------------
create table public.service_items (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade not null,
  title text not null,
  start_time time,
  duration_minutes integer,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.service_items enable row level security;

create index service_items_service_idx on public.service_items(service_id);

create policy "service_items_admin_all"
  on public.service_items for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "service_items_read_all"
  on public.service_items for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- SERVICE ASSIGNMENTS
-- ----------------------------------------------------------------------------
create table public.service_assignments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  role text not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.service_assignments enable row level security;

create index service_assignments_service_idx on public.service_assignments(service_id);
create index service_assignments_member_idx on public.service_assignments(member_id);

create policy "service_assignments_admin_all"
  on public.service_assignments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "service_assignments_read_worker"
  on public.service_assignments for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- ATTENDANCE
-- ----------------------------------------------------------------------------
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  visitor_id uuid references public.visitors(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  cell_group_id uuid references public.cell_groups(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  event_id uuid,
  attendance_type text not null
    check (attendance_type in ('sunday_service', 'midweek_service', 'bible_study', 'prayer_meeting',
                               'cell_group', 'department', 'event', 'children_ministry', 'youth_ministry')),
  check_in_time timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.attendance enable row level security;

create index attendance_member_idx on public.attendance(member_id);
create index attendance_visitor_idx on public.attendance(visitor_id);
create index attendance_service_idx on public.attendance(service_id);
create index attendance_type_idx on public.attendance(attendance_type);
create index attendance_check_in_idx on public.attendance(check_in_time);

create policy "attendance_admin_all"
  on public.attendance for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "attendance_read_leader"
  on public.attendance for select
  using (public.is_leader());

-- ----------------------------------------------------------------------------
-- EVENTS
-- ----------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type text,
  start_date date not null,
  end_date date,
  start_time time,
  end_time time,
  location text,
  capacity integer,
  registration_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create trigger set_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create index events_start_date_idx on public.events(start_date);

create policy "events_admin_all"
  on public.events for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "events_read_all"
  on public.events for select
  using (auth.uid() is not null);

-- Attendance.event_id FK is added after events table exists
alter table public.attendance
  add constraint attendance_event_id_fkey
  foreign key (event_id) references public.events(id) on delete set null;

-- ----------------------------------------------------------------------------
-- EVENT REGISTRATIONS
-- ----------------------------------------------------------------------------
create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade,
  name text,
  email text,
  phone text,
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.event_registrations enable row level security;

create index event_registrations_event_idx on public.event_registrations(event_id);
create index event_registrations_member_idx on public.event_registrations(member_id);

create policy "event_registrations_admin_all"
  on public.event_registrations for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "event_registrations_read_all"
  on public.event_registrations for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- EVENT CHECKINS
-- ----------------------------------------------------------------------------
create table public.event_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade,
  registration_id uuid references public.event_registrations(id) on delete set null,
  check_in_time timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.event_checkins enable row level security;

create index event_checkins_event_idx on public.event_checkins(event_id);
create index event_checkins_member_idx on public.event_checkins(member_id);

create policy "event_checkins_admin_all"
  on public.event_checkins for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "event_checkins_read_leader"
  on public.event_checkins for select
  using (public.is_leader());

-- ----------------------------------------------------------------------------
-- PRAYER REQUESTS
-- ----------------------------------------------------------------------------
create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  requester_name text,
  content text not null,
  privacy text not null default 'public'
    check (privacy in ('private', 'pastor_only', 'prayer_team', 'public')),
  status text not null default 'new'
    check (status in ('new', 'praying', 'follow_up', 'answered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prayer_requests enable row level security;

create trigger set_prayer_requests_updated_at
  before update on public.prayer_requests
  for each row execute function public.set_updated_at();

create index prayer_requests_status_idx on public.prayer_requests(status);
create index prayer_requests_member_idx on public.prayer_requests(member_id);

create policy "prayer_requests_admin_all"
  on public.prayer_requests for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "prayer_requests_owner_read"
  on public.prayer_requests for select
  using (member_id in (select id from public.members where user_id = auth.uid()) or public.is_leader());

create policy "prayer_requests_public_read"
  on public.prayer_requests for select
  using (privacy = 'public');

-- ----------------------------------------------------------------------------
-- PASTORAL RECORDS (highly confidential)
-- ----------------------------------------------------------------------------
create table public.pastoral_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade not null,
  record_type text not null,
  notes text not null,
  handled_by uuid references public.profiles(id) on delete set null not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pastoral_records enable row level security;

create trigger set_pastoral_records_updated_at
  before update on public.pastoral_records
  for each row execute function public.set_updated_at();

create index pastoral_records_member_idx on public.pastoral_records(member_id);

-- Only pastors/super admins can access pastoral records
create policy "pastoral_records_pastor_all"
  on public.pastoral_records for all
  using (public.is_pastor())
  with check (public.is_pastor());

-- ----------------------------------------------------------------------------
-- SERMONS
-- ----------------------------------------------------------------------------
create table public.sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  speaker text,
  description text,
  scripture_references text[],
  categories text[],
  tags text[],
  audio_url text,
  video_url text,
  pdf_url text,
  published_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sermons enable row level security;

create trigger set_sermons_updated_at
  before update on public.sermons
  for each row execute function public.set_updated_at();

create index sermons_published_date_idx on public.sermons(published_date);
create index sermons_title_idx on public.sermons(title);

create policy "sermons_admin_all"
  on public.sermons for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "sermons_read_all"
  on public.sermons for select
  using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- CONTENT (Bible studies, devotionals, documents, etc.)
-- ----------------------------------------------------------------------------
create table public.content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_type text not null
    check (content_type in ('bible_study', 'devotional', 'document', 'pdf', 'other')),
  body text,
  file_url text,
  categories text[],
  tags text[],
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content enable row level security;

create trigger set_content_updated_at
  before update on public.content
  for each row execute function public.set_updated_at();

create policy "content_admin_all"
  on public.content for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "content_read_all"
  on public.content for select
  using (auth.uid() is not null or published);

-- ----------------------------------------------------------------------------
-- ANNOUNCEMENTS
-- ----------------------------------------------------------------------------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  audience text not null default 'everyone'
    check (audience in ('everyone', 'workers', 'youth', 'department', 'cell_group', 'specific')),
  image_url text,
  video_url text,
  document_url text,
  publish_date timestamptz not null default now(),
  expiry_date timestamptz,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create trigger set_announcements_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

create index announcements_publish_date_idx on public.announcements(publish_date);

create policy "announcements_admin_all"
  on public.announcements for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "announcements_read_published"
  on public.announcements for select
  using (published and (expiry_date is null or expiry_date > now()) or auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  type text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create index notifications_user_idx on public.notifications(user_id);
create index notifications_read_idx on public.notifications(read);

create policy "notifications_owner_all"
  on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- DONATIONS
-- ----------------------------------------------------------------------------
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  member_id uuid references public.members(id) on delete set null,
  donation_type text not null
    check (donation_type in ('tithe', 'offering', 'donation', 'pledge', 'building_fund',
                             'missions', 'welfare', 'department_fund')),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  transaction_ref text,
  payment_method text,
  donation_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donations enable row level security;

create trigger set_donations_updated_at
  before update on public.donations
  for each row execute function public.set_updated_at();

create index donations_member_idx on public.donations(member_id);
create index donations_type_idx on public.donations(donation_type);
create index donations_date_idx on public.donations(donation_date);

create policy "donations_finance_all"
  on public.donations for all
  using (public.is_finance_user())
  with check (public.is_finance_user());

create policy "donations_owner_read"
  on public.donations for select
  using (member_id in (select id from public.members where user_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- TRANSACTIONS (income/expense — flexible, provider-agnostic)
-- ----------------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_type text not null check (transaction_type in ('income', 'expense')),
  category text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  description text,
  transaction_date date not null default current_date,
  related_donation_id uuid references public.donations(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create index transactions_type_idx on public.transactions(transaction_type);
create index transactions_date_idx on public.transactions(transaction_date);
create index transactions_category_idx on public.transactions(category);

create policy "transactions_finance_all"
  on public.transactions for all
  using (public.is_finance_user())
  with check (public.is_finance_user());

-- ----------------------------------------------------------------------------
-- EXPENSES
-- ----------------------------------------------------------------------------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  expense_date date not null default current_date,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

create index expenses_date_idx on public.expenses(expense_date);
create index expenses_category_idx on public.expenses(category);

create policy "expenses_finance_all"
  on public.expenses for all
  using (public.is_finance_user())
  with check (public.is_finance_user());

-- ----------------------------------------------------------------------------
-- BUDGETS
-- ----------------------------------------------------------------------------
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.budgets enable row level security;

create trigger set_budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

create policy "budgets_finance_all"
  on public.budgets for all
  using (public.is_finance_user())
  with check (public.is_finance_user());

-- ----------------------------------------------------------------------------
-- REPORTS
-- ----------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  title text not null,
  description text,
  parameters jsonb,
  generated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "reports_admin_all"
  on public.reports for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "reports_read_leader"
  on public.reports for select
  using (public.is_leader());

-- ----------------------------------------------------------------------------
-- AUDIT LOGS (write-only for normal users, read for admins)
-- ----------------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null
    check (action in ('login', 'logout', 'create', 'update', 'delete', 'financial_transaction',
                      'permission_change', 'export', 'pastoral_access')),
  resource text not null,
  resource_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create index audit_logs_user_idx on public.audit_logs(user_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at);

create policy "audit_logs_insert"
  on public.audit_logs for insert
  with check (auth.uid() is not null or public.is_admin());

create policy "audit_logs_admin_select"
  on public.audit_logs for select
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- STORAGE BUCKETS (allow authenticated users to upload to public buckets,
--   optional — create via dashboard). Enabling basic policies:
-- ----------------------------------------------------------------------------
-- Note: storage buckets are created separately. These policies are examples,
--   enable/adjust as needed in the dashboard.
-- create policy "public_uploads_authenticated"
--   on storage.objects for insert
--   with check (bucket_id in ('profile-photos', 'sermons', 'content', 'events', 'announcements')
--               and auth.role() = 'authenticated');
