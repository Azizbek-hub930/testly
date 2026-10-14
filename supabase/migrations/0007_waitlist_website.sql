-- 0007: website field for platform / startup applicants.
-- Public may insert it; only admins read it (see 0001). Safe to re-run.

alter table public.waitlist add column if not exists website text;

alter table public.waitlist drop constraint if exists waitlist_website_len;
alter table public.waitlist add constraint waitlist_website_len
  check (website is null or char_length(website) <= 200);

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
  new.website      := nullif(trim(coalesce(new.website, '')), '');

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

grant insert (website) on public.waitlist to anon, authenticated;
