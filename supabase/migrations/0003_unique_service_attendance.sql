-- Prevent marking the same member more than once for a service on the same UTC calendar day.
create unique index if not exists attendance_member_service_day_unique
  on public.attendance (
    member_id,
    service_id,
    ((check_in_time at time zone 'UTC')::date)
  )
  where service_id is not null and member_id is not null;
