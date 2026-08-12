-- ============================================================================
-- Testly · migration 0004 · appoint the first administrator
--
-- HOW TO USE
--   1. Create the account normally through the app (/signup) or the Supabase
--      dashboard (Authentication → Users → Add user).
--   2. Change ADMIN_EMAIL below if you want a different founder account.
--   3. Run this file in the SQL editor.
--
-- This is the ONLY supported way to create an admin. There is no code path in
-- the application — public or authenticated — that can grant the admin role:
--   * `role` is not in the column grants handed to `authenticated`
--   * `profiles_guard_role` raises 42501 on any self-promotion attempt
--   * a session without a JWT (this SQL editor, or the service-role key on the
--     server) is the only context allowed to change the column
--
-- Existing admins can promote further users from /admin/users, which runs
-- server-side and re-checks the caller's role against the database.
-- ============================================================================

do $$
declare
  admin_email constant text := 'azizbekboyxorozov2010@gmail.com';
  target_id   uuid;
begin
  select id into target_id
    from auth.users
   where lower(email) = lower(admin_email)
   limit 1;

  if target_id is null then
    raise exception
      'No auth user found for %. Sign up with that email first, then re-run this migration.',
      admin_email;
  end if;

  -- The profile normally exists already (created by the on_auth_user_created
  -- trigger); insert defensively for accounts created before 0001 ran.
  insert into public.profiles (id, email)
  values (target_id, lower(admin_email))
  on conflict (id) do nothing;

  update public.profiles
     set role = 'admin'
   where id = target_id;

  raise notice 'Testly: % is now an administrator.', admin_email;
end;
$$;
