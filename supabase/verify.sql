-- ============================================================================
-- Testly · schema verification
--
-- Read-only. Changes nothing. Run this after the migrations to confirm the
-- database is actually set up, rather than trusting that each file said
-- "Success".
--
-- Every row should say PASS.
-- ============================================================================

with checks as (
  select
    1 as sort_order,
    'Tables created' as check_name,
    (
      select count(*) from information_schema.tables
       where table_schema = 'public'
         and table_name in ('profiles', 'waitlist', 'documents', 'assessments', 'questions')
    ) as found,
    5 as expected

  union all
  select
    2,
    'Row Level Security switched on',
    (
      select count(*) from pg_tables
       where schemaname = 'public'
         and tablename in ('profiles', 'waitlist', 'documents', 'assessments', 'questions')
         and rowsecurity
    ),
    5

  union all
  select
    3,
    'Access policies',
    (select count(*) from pg_policies where schemaname = 'public'),
    17

  union all
  select
    4,
    'Helper functions',
    (
      select count(*) from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and p.proname in (
           'is_admin', 'waitlist_stats', 'handle_new_user', 'set_updated_at',
           'guard_profile_role', 'normalize_waitlist_row', 'handle_user_email_change'
         )
    ),
    7

  union all
  select
    5,
    'Signup trigger on auth.users',
    (select count(*) from pg_trigger where tgname = 'on_auth_user_created' and not tgisinternal),
    1

  union all
  select
    6,
    'Private storage bucket "sources"',
    (select count(*) from storage.buckets where id = 'sources' and public = false),
    1

  union all
  select
    7,
    'Storage policies',
    (
      select count(*) from pg_policies
       where schemaname = 'storage'
         and tablename = 'objects'
         and policyname like 'sources_%'
    ),
    4
)
select
  check_name                                     as "Check",
  found || ' / ' || expected                     as "Found / Expected",
  case when found >= expected then 'PASS' else 'FAIL' end as "Status"
from checks
order by sort_order;
