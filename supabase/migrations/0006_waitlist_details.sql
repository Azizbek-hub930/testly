-- 0006: richer waitlist submissions
--
-- The landing page now collects what the team needs to reach out personally:
-- phone, Telegram, city, how many students the applicant prepares, which
-- exams they care about, and a free-text message.
--
-- Same security model as 0001: the public may INSERT these columns and
-- nothing else; only admins can read the table.
--
-- Run in the Supabase SQL editor after 0001–0005. Safe to re-run.

alter table public.waitlist add column if not exists phone         text;
alter table public.waitlist add column if not exists telegram      text;
alter table public.waitlist add column if not exists city          text;
alter table public.waitlist add column if not exists students      text;
alter table public.waitlist add column if not exists exams         text;
alter table public.waitlist add column if not exists message       text;

alter table public.waitlist drop constraint if exists waitlist_phone_len;
alter table public.waitlist add constraint waitlist_phone_len
  check (phone is null or char_length(phone) between 5 and 40);

alter table public.waitlist drop constraint if exists waitlist_telegram_len;
alter table public.waitlist add constraint waitlist_telegram_len
  check (telegram is null or char_length(telegram) <= 64);

alter table public.waitlist drop constraint if exists waitlist_city_len;
alter table public.waitlist add constraint waitlist_city_len
  check (city is null or char_length(city) <= 80);

alter table public.waitlist drop constraint if exists waitlist_students_len;
alter table public.waitlist add constraint waitlist_students_len
  check (students is null or char_length(students) <= 40);

alter table public.waitlist drop constraint if exists waitlist_exams_len;
alter table public.waitlist add constraint waitlist_exams_len
  check (exams is null or char_length(exams) <= 80);

alter table public.waitlist drop constraint if exists waitlist_message_len;
alter table public.waitlist add constraint waitlist_message_len
  check (message is null or char_length(message) <= 1000);

-- Extend normalisation to the new columns.
create or replace function public.normalize_waitlist_row()
returns trigger
language plpgsql
as $$
begin
  new.email        := lower(trim(new.email));
  new.name         := trim(new.name);
  new.organization := nullif(trim(coalesce(new.organization, '')), '');
  new.role         := nullif(trim(coalesce(new.role, '')), '');
  new.source       := nullif(trim(coalesce(new.source, '')), '');
  new.phone        := nullif(trim(coalesce(new.phone, '')), '');
  new.telegram     := nullif(trim(coalesce(new.telegram, '')), '');
  new.city         := nullif(trim(coalesce(new.city, '')), '');
  new.students     := nullif(trim(coalesce(new.students, '')), '');
  new.exams        := nullif(trim(coalesce(new.exams, '')), '');
  new.message      := nullif(trim(coalesce(new.message, '')), '');

  if new.source is null then
    new.source := 'landing';
  end if;

  if tg_op = 'INSERT' then
    -- `notes` is an admin-only field; never accept it from a public insert.
    new.notes      := null;
    new.created_at := now();
  end if;

  return new;
end;
$$;

-- Column-level grants: the public can write the new fields on insert only.
grant insert (phone, telegram, city, students, exams, message)
  on public.waitlist to anon, authenticated;
