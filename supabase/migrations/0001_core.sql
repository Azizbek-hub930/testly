-- ============================================================================
-- Testly · migration 0001 · core schema
--   * helper functions (updated_at, is_admin)
--   * profiles  (1:1 with auth.users)
--   * waitlist  (public early-access submissions)
--
-- Run this in the Supabase SQL editor, or with `supabase db push`.
-- Safe to re-run: every statement is idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  full_name    text,
  organization text,
  role         text not null default 'user',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint profiles_role_check check (role in ('user', 'admin')),
  constraint profiles_full_name_len check (full_name is null or char_length(full_name) <= 120),
  constraint profiles_organization_len check (organization is null or char_length(organization) <= 160)
);

comment on table public.profiles is
  'Application profile for each auth user. `role` is never writable by the user themselves.';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- ---------------------------------------------------------------------------
-- is_admin()
--
-- SECURITY DEFINER so the lookup runs as the table owner and therefore bypasses
-- RLS on `profiles`. Without this, a policy on `profiles` that calls it would
-- recurse into itself.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Role-escalation guard.
--
-- Column grants below already stop a user from writing `role`, but this trigger
-- is the second lock: even a mis-configured grant cannot turn a user into an
-- admin. Only a session with no JWT (service role / SQL editor) or an existing
-- admin may change the column.
-- ---------------------------------------------------------------------------

create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- No JWT => service_role key or a direct SQL session. That is the
    -- documented, server-side way to appoint an administrator.
    if auth.uid() is null then
      return new;
    end if;

    if not public.is_admin(auth.uid()) then
      raise exception 'insufficient_privilege: profile role is not self-assignable'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------------
-- Keep profiles in sync with auth.users
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, organization, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'organization', '')), ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set email = coalesce(new.email, '')
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Backfill profiles for users that existed before this migration.
insert into public.profiles (id, email, full_name)
select
  u.id,
  coalesce(u.email, ''),
  nullif(trim(coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    ''
  )), '')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- waitlist
-- ---------------------------------------------------------------------------

create table if not exists public.waitlist (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  organization text,
  role         text,
  source       text not null default 'landing',
  notes        text,
  created_at   timestamptz not null default now(),

  constraint waitlist_email_unique unique (email),
  constraint waitlist_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint waitlist_email_len check (char_length(email) between 3 and 254),
  constraint waitlist_name_len check (char_length(name) between 1 and 120),
  constraint waitlist_org_len check (organization is null or char_length(organization) <= 160),
  constraint waitlist_role_len check (role is null or char_length(role) <= 60),
  constraint waitlist_source_len check (char_length(source) <= 60),
  constraint waitlist_notes_len check (notes is null or char_length(notes) <= 2000)
);

comment on table public.waitlist is
  'Early-access signups from the public landing page. Insert-only for the public; readable by admins only.';

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);
create index if not exists waitlist_role_idx on public.waitlist (role);
create index if not exists waitlist_organization_idx on public.waitlist (organization);

-- Normalise input so the unique constraint actually catches duplicates, and so
-- the public cannot write fields it has no business writing.
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

drop trigger if exists waitlist_normalize on public.waitlist;
create trigger waitlist_normalize
  before insert or update on public.waitlist
  for each row execute function public.normalize_waitlist_row();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.waitlist enable row level security;

-- profiles ------------------------------------------------------------------

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- waitlist ------------------------------------------------------------------

drop policy if exists waitlist_public_insert on public.waitlist;
create policy waitlist_public_insert
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

drop policy if exists waitlist_admin_select on public.waitlist;
create policy waitlist_admin_select
  on public.waitlist for select
  to authenticated
  using (public.is_admin());

drop policy if exists waitlist_admin_update on public.waitlist;
create policy waitlist_admin_update
  on public.waitlist for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists waitlist_admin_delete on public.waitlist;
create policy waitlist_admin_delete
  on public.waitlist for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants
--
-- RLS decides *which rows*; grants decide *which columns and verbs*. Postgres
-- cannot subtract a column privilege from a table-wide grant, so we revoke the
-- table grant first and hand back exactly what each role needs.
-- ---------------------------------------------------------------------------

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, organization, avatar_url) on public.profiles to authenticated;

revoke all on public.waitlist from anon, authenticated;
grant insert (name, email, organization, role, source) on public.waitlist to anon, authenticated;
grant select, delete on public.waitlist to authenticated;
grant update (name, organization, role, source, notes) on public.waitlist to authenticated;
