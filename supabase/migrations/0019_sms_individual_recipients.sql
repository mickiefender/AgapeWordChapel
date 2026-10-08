alter table public.sms_history
  drop constraint if exists sms_history_audience_check;

alter table public.sms_history
  add constraint sms_history_audience_check
  check (audience in ('all', 'active', 'workers', 'individual_member', 'manual_number'));
