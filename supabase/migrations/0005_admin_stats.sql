-- ============================================================================
-- Testly · migration 0005 · admin statistics
--
-- One round trip for the admin overview instead of pulling the whole waitlist
-- into the browser to count it. SECURITY DEFINER, with an explicit admin check
-- inside — a non-admin calling this gets 42501, exactly like a direct select.
--
-- Requires 0001_core.sql.
-- ============================================================================

create or replace function public.waitlist_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result json;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select json_build_object(
    'total', (select count(*) from public.waitlist),
    'today', (
      select count(*) from public.waitlist
       where created_at >= date_trunc('day', now())
    ),
    'week', (
      select count(*) from public.waitlist
       where created_at >= now() - interval '7 days'
    ),
    'organizations', (
      select count(distinct organization) from public.waitlist
       where organization is not null
    ),
    'roles', (
      select coalesce(
        json_agg(json_build_object('role', role, 'count', total) order by total desc),
        '[]'::json
      )
      from (
        select coalesce(role, 'Unspecified') as role, count(*) as total
          from public.waitlist
         group by coalesce(role, 'Unspecified')
      ) role_counts
    ),
    'organization_list', (
      select coalesce(json_agg(organization order by organization), '[]'::json)
      from (
        select distinct organization
          from public.waitlist
         where organization is not null
      ) orgs
    ),
    'daily', (
      select coalesce(
        json_agg(json_build_object('day', day, 'count', total) order by day),
        '[]'::json
      )
      from (
        select date_trunc('day', created_at)::date as day, count(*) as total
          from public.waitlist
         where created_at >= now() - interval '30 days'
         group by 1
      ) series
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.waitlist_stats() from public, anon;
grant execute on function public.waitlist_stats() to authenticated, service_role;
